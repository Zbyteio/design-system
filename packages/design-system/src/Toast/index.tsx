import React, { Dispatch } from "react";
import { CommonComponentProps, ToastTypeOptions } from "Types/common";
import { Classes } from "Constants/classes";
import { Variant } from "Constants/variants";
import styled from "styled-components";
import { Icon, IconSize, Text, TextType } from "../index";
import { toast, ToastOptions, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as log from "loglevel";

export type ToastProps = ToastOptions &
  CommonComponentProps & {
    contentClassName?: string;
    text: string;
    actionElement?: JSX.Element;
    variant?: Variant;
    duration?: number;
    onUndo?: () => void;
    dispatchableAction?: {
      dispatch: Dispatch<any>;
      type: string;
      payload: any;
    };
    showDebugButton?: any;
    hideProgressBar?: boolean;
    hideActionElementSpace?: boolean;
    width?: string;
    maxWidth?: string;
  };

const WrappedToastContainer = styled.div`
  .Toastify__toast-container {
    width: auto;
    padding: 0px;
  }
  .Toastify__toast--default {
    background: transparent;
  }
  .Toastify__toast {
    cursor: auto;
    min-height: auto;
    border-radius: 0px !important;
    // font-family: ${(props) => props.theme.fonts.text};
    margin-bottom: var(--ads-spaces-4);
  }
  .Toastify__toast-container--top-right {
    top: 8em;
  }
`;
export function StyledToastContainer(props: ToastOptions) {
  return (
    <WrappedToastContainer>
      <ToastContainer {...props} />
    </WrappedToastContainer>
  );
}

const ToastBody = styled.div<{
  variant?: Variant;
  isUndo?: boolean;
  dispatchableAction?: {
    dispatch: Dispatch<any>;
    type: string;
    payload: any;
  };
  width?: string;
  maxWidth?: string;
}>`
  width: ${(props) => props.width || "fit-content"};
  max-width: ${(props) => props.maxWidth || "264px"};
  margin-left: auto;
  background: var(--ads-toast-background-color);
  padding: var(--ads-spaces-4) var(--ads-spaces-5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  // Using word-break here, as overflow-wrap: anywhere
  // has no effect in safari
  word-break: break-word;
  overflow-wrap: anywhere;

  div > .${Classes.ICON} {
    cursor: auto;
    margin-right: var(--ads-spaces-3);
    margin-top: calc(var(--ads-spaces-1) / 2);
    svg {
      path {
        fill: ${(props) =>
          props.variant === Variant.warning
            ? "var(--ads-toast-icon-fill-color)"
            : props.variant === Variant.danger
            ? "#FFFFFF"
            : "#9F9F9F"};
      }
      rect {
        ${(props) =>
          props.variant === Variant.danger
            ? `fill: var(--ads-toast-icon-outline-color)`
            : null};
      }
    }
  }

  .${Classes.TEXT} {
    color: var(--ads-toast-text-color);
  }

  ${(props) =>
    props.isUndo || props.dispatchableAction
      ? `
    .undo-section .${Classes.TEXT} {
      cursor: pointer;
      margin-left: var(--ads-spaces-3);
      color: var(--ads-toast-undo-text-color);
      line-height: 18px;
      font-weight: 600;
      white-space: nowrap
    }
    `
      : null}
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex: 1;
`;

const ToastTextWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledActionText = styled(Text)`
  color: var(--ads-toast-redo-text-color) !important;
  cursor: pointer;
  margin-left: var(--ads-spaces-3);
`;

export function ToastComponent(
  props: ToastProps & { undoAction?: () => void },
) {
  const dispatch = props.dispatchableAction?.dispatch;
  const dispatchableAction = {
    type: props.dispatchableAction?.type,
    payload: props.dispatchableAction?.payload,
  };

  return (
    <ToastBody
      className="t--toast-action"
      dispatchableAction={props.dispatchableAction}
      isUndo={!!props.onUndo}
      maxWidth={props.maxWidth}
      variant={props.variant || Variant.info}
      width={props.width}
    >
      <FlexContainer style={{ minWidth: 0 }}>
        {props.variant === Variant.success ? (
          <Icon
            fillColor={"var(--ads-old-color-jade)"}
            name="success"
            size={IconSize.XXL}
          />
        ) : props.variant === Variant.warning ? (
          <Icon name="warning" size={IconSize.XXL} />
        ) : null}
        {props.variant === Variant.danger ? (
          <Icon name="error" size={IconSize.XXL} />
        ) : null}
        <ToastTextWrapper>
          <Text className={props.contentClassName} type={TextType.P1}>
            {props.text}
          </Text>
          {props.actionElement && (
            <StyledActionText type={TextType.P1}>
              {!props.hideActionElementSpace ? <>&nbsp;</> : ""}
              {props.actionElement}
            </StyledActionText>
          )}
          {props.variant === Variant.danger && props.showDebugButton ? (
            <props.showDebugButton.component
              {...props.showDebugButton.componentProps}
              style={{ marginLeft: "auto" }}
            />
          ) : null}
        </ToastTextWrapper>
      </FlexContainer>
      <div className="undo-section">
        {props.onUndo || props.dispatchableAction ? (
          <Text
            onClick={() => {
              if (dispatch && props.dispatchableAction) {
                dispatch(dispatchableAction);
                props.undoAction && props.undoAction();
              } else {
                props.undoAction && props.undoAction();
              }
            }}
            type={TextType.H6}
          >
            UNDO
          </Text>
        ) : null}
      </div>
    </ToastBody>
  );
}

export const Toaster = {
  show: (config: ToastProps) => {
    if (typeof config.text !== "string") {
      log.error("Toast message needs to be a string");
      return;
    }
    if (config.variant && !Object.values(Variant).includes(config.variant)) {
      log.error(
        "Toast type needs to be a one of " +
          Object.values(ToastTypeOptions).join(", "),
      );
      return;
    }
    // Stringified JSON is a long, but valid key :shrug:
    const toastId = JSON.stringify(config);
    toast(
      <ToastComponent
        undoAction={() => {
          toast.dismiss(toastId);
          config.onUndo && config.onUndo();
        }}
        {...config}
      />,
      {
        toastId: toastId,
        pauseOnHover: !config.dispatchableAction && !config.hideProgressBar,
        pauseOnFocusLoss: !config.dispatchableAction && !config.hideProgressBar,
        autoClose: false,
        closeOnClick: true,
        position: "top-center",
        hideProgressBar: config.hideProgressBar,
      },
    );
    if (config.autoClose !== false) {
      // Update autoclose everytime to keep resetting the timer.
      toast.update(toastId, {
        autoClose: config.duration || 5000,
      });
    }
  },
  clear: () => toast.dismiss(),
};
