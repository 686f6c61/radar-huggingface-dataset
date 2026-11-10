# taurusduan/Qwen-Image-2.1-Uncensored-Omni-Quantized

## Resumen

Taurusduan/Qwen-Image-2.1-Uncensored-Omni-Quantized es una compilacion de pesos cuantizados del transformer de Qwen/Qwen-Image-2.1, un modelo de difusion para generacion texto-a-imagen y edicion de imagenes desarrollado originalmente por el equipo Qwen de Alibaba. Sobre el modelo base se ha fusionado un adaptador LoRA de rango 128 denominado "Omni" (procedente de ChatR Labs) con fuerza 1.0, y el resultado se distribuye en multiples formatos cuantizados: GGUF (BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0), FP8 E4M3, INT8 ConvRot, NVFP4, FP8 con torchao, NF4 e INT8 con bitsandbytes, ademas de safetensors BF16.

El repositorio contiene unicamente los pesos del transformer: el text encoder, el procesador y el VAE deben tomarse del repositorio base Qwen/Qwen-Image-2.1. El modelo cuenta con 7.115.124.736 parametros y un tamano de repositorio de 92,5 GB debido a la multiplicidad de formatos. La orientacion "uncensored" del adaptador implica que se ha reducido el filtrado de contenido respecto al modelo original, lo que resulta relevante para investigadores que necesiten evaluar el comportamiento del modelo sin restricciones de alineamiento, pero tambien conlleva riesgos de uso.

La relevancia actual radica en la combinacion de un modelo de difusion de ultima generacion con un ecosistema de cuantizaciones amplio que permite desplegarlo desde GPUs de consumo hasta aceleradores de datacenter, con soporte tanto para ComfyUI como para Diffusers. La licencia qwen-research restringe el uso comercial, lo que limita su adopcion en produccion sin autorizacion expresa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (modelo base Qwen-Image-2.1); pesos del transformer unicamente |
| Parametros totales | 7.115.124.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, GGUF (BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0), FP8 E4M3, INT8 ConvRot, NVFP4, FP8 (torchao), NF4 (bitsandbytes), INT8 (bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (license: other) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 es un modelo de difusion para generacion y edicion de imagenes. Sobre el se ha fusionado un adaptador LoRA de rango 128 ("Omni") con fuerza 1.0, y el transformer resultante se ha cuantizado en los formatos listados. La model card no detalla la arquitectura interna del transformer (numero de capas, dimensiones ocultas, mecanismo de atencion) ni los datos de entrenamiento originales del modelo base, por lo que esa informacion debe consultarse en el repositorio Qwen/Qwen-Image-2.1.

La innovacion tecnica destacable de esta publicacion es la diversidad de layouts y cuantizaciones: los ficheros con layout de 297 tensores mantienen las proyecciones `gate_layer` y `proj` separadas, mientras que los de 265 tensores usan la proyeccion fusionada `img_mlp.gate_up`. El cargador debe soportar el layout seleccionado. Ademas, se proporcionan builds especificos para ComfyUI (FP8, INT8 ConvRot, NVFP4) y para Diffusers (FP8 torchao, NF4 e INT8 bitsandbytes), con distintos requisitos de dependencias. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con resoluciones de 768x1152 o 1024x1024.
- Edicion de imagenes: la imagen de referencia se codifica mediante el nodo `Text Encoder (Qwen-Image)` en modo edicion.
- Soporte de CFG real (true CFG) con escala recomendada de 5.0, tanto en generacion como en edicion.
- Compatibilidad con ComfyUI mediante `Unet Loader (GGUF)` o `Load Diffusion Model` para los ficheros nativos.
- Compatibilidad con Diffusers mediante `from_pretrained` o `from_single_file`.
- Soporte de cache KV durante la inferencia.
- Orientacion "uncensored": el adaptador reduce el filtrado de contenido respecto al modelo base.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio, dado que es un modelo de difusion para imagenes.

## Casos de uso

- Generacion de ilustraciones y concept art: con 35 pasos de muestreo, sampler `er_sde` y CFG 5.0, el modelo produce imagenes de 1024x1024 adecuadas para prototipado visual rapido en estudios de diseno.
- Edicion de imagenes por referencia: el flujo de edicion permite modificar una imagen existente codificandola con el text encoder en modo edicion, util para retoques o variaciones controladas.
- Investigacion sobre alineamiento y filtrado de contenido: la variante "uncensored" permite estudiar el comportamiento del modelo sin las restricciones del original, comparando salidas para analizar sesgos y limites de seguridad.
- Despliegue en GPUs de consumo: la cuantizacion NF4 (3,67 GB) o Q4_0 GGUF (4,20 GB) permite ejecutar el transformer en tarjetas con 8 GB de VRAM, facilitando pruebas locales.
- Integracion en pipelines de ComfyUI: los builds FP8, INT8 ConvRot y NVFP4 estan pensados para el cargador nativo de ComfyUI 0.39.0, lo que permite incorporarlos a flujos de trabajo existentes de generacion de imagenes.
- Evaluacion comparativa de cuantizaciones: al ofrecer el mismo modelo en 12 formatos, sirve para medir el impacto de la cuantizacion en la fidelidad visual y el tiempo de inferencia.
- Generacion de contenido para investigacion creativa: la ausencia de filtrado permite explorar estilos y tematicas que el modelo base rechazaria, siempre dentro del marco legal y etico aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo transformer): aproximadamente 3,7 GB con NF4, 4,2 GB con NVFP4 o Q4_0, 4,5 GB con Q4_K_M, 5,2 GB con Q5_K_M, 6,0 GB con Q6_K, 7,1 GB con FP8/INT8, 7,7 GB con Q8_0 y 14,2 GB con BF16. A estas cifras hay que sumar la memoria del text encoder y del VAE del modelo base.
- GPU recomendadas: no se especifican en la model card. Por tamano, una RTX 3060 de 12 GB o superior puede alojar las variantes Q4 a Q8; las variantes BF16 requieren 16 GB o mas (RTX 4080/4090, A100, H100).
- Cabe en GPU de consumo: si, con las cuantizaciones NF4, NVFP4, Q4_0, Q4_K_M, Q5_K_M y Q6_K.
- Opciones de despliegue: ComfyUI (GGUF, FP8, INT8 ConvRot, NVFP4), Diffusers (FP8 torchao, NF4 e INT8 bitsandbytes, BF16 safetensors), GGUF via `from_single_file` en Diffusers.
- Latencia y throughput: no disponibles. La model card solo indica 35 pasos de muestreo con sampler `er_sde` y scheduler `simple`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| taurusduan/Qwen-Image-2.1-Uncensored-Omni-Quantized | 7.115.124.736 | no disponible | BF16, GGUF, FP8, INT8, NVFP4, NF4 | qwen-research | Hugging Face (0 descargas) |
| Qwen/Qwen-Image-2.1 (base) | no disponible en la informacion | no disponible | no disponible en la informacion | qwen-research | Hugging Face |
| Otras variantes cuantizadas de Qwen-Image | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas en la informacion proporcionada, por lo que la comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- La licencia qwen-research restringe el uso comercial; es necesario revisar el fichero LICENSE del repositorio antes de cualquier despliegue en produccion.
- El adaptador "uncensored" reduce el filtrado de contenido, lo que puede producir salidas inapropiadas, ofensivas o legalmente problematicas; no se recomienda su uso sin supervision humana.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar imagenes incoherentes o con artefactos, especialmente en cuantizaciones agresivas como Q4_0 o NF4.
- El repositorio solo incluye los pesos del transformer; es imprescindible descargar el text encoder, el procesador y el VAE del modelo base Qwen/Qwen-Image-2.1.
- Los layouts de 265 y 297 tensores no son intercambiables: el cargador debe soportar el layout del fichero seleccionado.
- Los ficheros `-comfy.safetensors` solo funcionan en ComfyUI; los de torchao y bitsandbytes solo en Diffusers.
- El flujo BF16 en ComfyUI solo se ha verificado con ComfyUI 0.39.0 (commit b0b7435) y frontend 1.53.6; no se garantiza compatibilidad con versiones anteriores.
- No se documentan sesgos especificos ni idiomas soportados; la informacion sobre evaluacion de sesgos es no disponible.
- El modelo no es de destilacion few-step: requiere 35 pasos de muestreo, lo que aumenta el coste computacional frente a variantes destiladas.
- Un prompt negativo vacio u omitido desactiva el true CFG aunque `true_cfg_scale` sea mayor que 1; debe usarse un espacio si no se necesita prompt negativo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taurusduan/Qwen-Image-2.1-Uncensored-Omni-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Playground de ChatR Labs: https://chatrlabs.com/
- ComfyUI (commit de referencia): https://github.com/Comfy-Org/ComfyUI/tree/b0b743566f65daafc423b4fea8a2fbda94b3384a
