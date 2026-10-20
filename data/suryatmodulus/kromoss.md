# suryatmodulus/Kromoss

## Resumen
Kromoss es un ajuste fino completo del modelo de difusión texto-a-imagen MOSS-Image-Base, publicado por el usuario de Hugging Face suryatmodulus. Genera imágenes a 1024 px y reutiliza la misma arquitectura, pipeline, codificador de texto Qwen3.5-9B y VAE FLUX.2 small que MOSS-Image-SFT, por lo que se presenta como un reemplazo directo en flujos de diffusers y ComfyUI. El modelo base pertenece a OpenMOSS-Team.

El objetivo principal del ajuste es corregir la borrosidad del modelo Base. El repositorio incluye además un LoRA turbo de 8 pasos basado en destilación DMD en espacio de datos, que permite generar con 8 pasos y CFG 1 sin rama negativa, frente a los 50 pasos y CFG 3 del modelo completo.

El checkpoint publicado corresponde al update 7000 con pesos EMA y se entrenó con 448k imágenes. La licencia declarada es Apache-2.0, el idioma soportado es inglés y el recuento de safetensors es de 5.082.308.624 parámetros, sin que la model card aclare si incluye el codificador de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen basado en MOSS-Image; transformer con muestreo flow-matching Euler, codificador de texto Qwen3.5-9B y VAE FLUX.2 small |
| Parametros totales | 5.082.308.624 según safetensors; la model card no aclara si incluye el codificador Qwen3.5-9B |
| Parametros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | No disponible; modelo text-to-image, no se especifica la ventana del codificador |
| Tipos de cuantizacion | bf16; int8 W8A8 ConvRot con rotación Hadamard de 256 y escalas por fila; LoRA en fp32 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; layout diffusers; single-file para ComfyUI en bf16 e int8; LoRA en safetensors |
| Resolución de generación | 1024 px |
| Modelo base | OpenMOSS-Team/MOSS-Image-Base |
| Tamaño del repositorio | 63,5 GB |

## Arquitectura y entrenamiento
Kromoss es un full fine-tune de MOSS-Image-Base a 1024 px. Mantiene la arquitectura de MOSS-Image: un transformer de difusión con muestreo flow-matching Euler, un codificador de texto Qwen3.5-9B y un VAE FLUX.2 small. En diffusers, el transformer y el codificador de texto usan bfloat16, mientras que el VAE y el ruido inicial usan float32. El modelo completo se muestrea con 50 pasos,
