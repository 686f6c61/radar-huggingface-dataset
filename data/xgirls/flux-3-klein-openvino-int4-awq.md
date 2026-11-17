# xgirls/flux-3-klein-openvino-int4-awq

## Resumen

`xgirls/flux-3-klein-openvino-int4-awq` es una conversión comunitaria a OpenVINO del modelo de generación de imágenes FLUX.3 Klein de Black Forest Labs, publicada por el usuario xgirls. El repositorio no contiene los pesos originales en PyTorch, sino los componentes ya convertidos a formato OpenVINO IR con cuantización mixta INT4/INT8, empaquetados junto con el tokenizador, el scheduler y un runner de inferencia (`infer.py`) listo para ejecutar generación texto-a-imagen en local.

El interés de esta ficha radica en que permite ejecutar un modelo de la familia FLUX.3 en hardware sin GPU dedicada de gama alta, usando el backend OpenVINO sobre CPU Intel o, con el plugin correspondiente, sobre GPU NVIDIA. El paquete ocupa aproximadamente 4,96 GiB repartidos en 37 archivos, lo que lo hace manejable en equipos de consumo.

Conviene señalar desde el principio que la model card del autor lo marca explícitamente como "WIP - not ready" (trabajo en curso, no listo para producción). Es una conversión no oficial, no avalada por Black Forest Labs ni por Intel, y la licencia de uso sigue siendo la FLUX Kommunity License v1.0 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline modular Diffusers FLUX.3 (transformer + text encoder + VAE), exportado a OpenVINO IR |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta INT4/INT8 en transformer y text encoder; INT8 en encoder y decoder VAE |
| Idiomas soportados | en (ingles) |
| Licencia | flux-kommunity-license-v1.0 (FLUX Kommunity License) |
| Formato de pesos | OpenVINO IR (grafos XML + ficheros binarios de pesos); no incluye checkpoint PyTorch original |

## Arquitectura y entrenamiento

El modelo subyacente es FLUX.3 Klein de Black Forest Labs, un modelo de difusión texto-a-imagen. Esta publicación no entrena ni ajusta el modelo: se limita a exportar los componentes del pipeline modular de Diffusers (`Flux3DistilledModularPipeline`) a representación intermedia OpenVINO, aplicando cuantización mixta. El transformer y el text encoder usan INT4/INT8, mientras que el encoder y el decoder del VAE se mantienen en INT8. El paquete incluye los subdirectorios `text_encoder/`, `transformer/`, `vae_encoder/`, `vae_decoder/`, `tokenizer/` y `scheduler/`, además de los índices de pipeline y ficheros de configuración.

La revisión de exportación documentada es `29897d55e25a132fa74892ea5ea605168b0da78b`. No se detallan en la información disponible los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas de alineación), ni innovaciones arquitectónicas internas más allá de la propia familia FLUX.3. El runner incluye una muestra de validación con semilla fija a 1024×1024 generada íntegramente con los componentes OpenVINO (text encoder, transformer y VAE decoder). Para dispositivos NVIDIA, el runner aplica reescrituras de compatibilidad BF16 al transformer y solicita precisión de inferencia FP32; para dispositivos OpenVINO `GPU` también se solicita FP32 en el transformer.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image) mediante el pipeline modular FLUX.3.
- Resoluciones de trabajo validadas: 512×512 y 1024×1024, con 16 pasos de muestreo en los ejemplos de la model card.
- Control de semilla para reproducibilidad (`--seed`), dimensiones (`--height`, `--width`) y número de pasos (`--steps`).
- Ejecución en CPU mediante OpenVINO por defecto (`--ov-device CPU`).
- Ejecución en GPU NVIDIA mediante el plugin OpenVINO NVIDIA (`--ov-device NVIDIA`), validada en una Lambda A100.
- Selección separada del dispositivo del scheduler y tensores de imagen (`--torch-device`) y del dispositivo OpenVINO (`--ov-device`).
- Descarga automática del repositorio desde el Hub en el primer uso, o carga desde una copia local con `--model`.
- Soporte de prompts en inglés (idioma declarado: `en`).
- No se documentan capacidades de edición de imagen, inpainting, controlnet, tool calling ni razonamiento multi-paso.

## Casos de uso

- Generación de ilustraciones y material gráfico en equipos sin GPU dedicada: al ejecutarse por defecto sobre CPU con OpenVINO, permite producir imágenes de 1024×1024 en estaciones de trabajo convencionales con 16 pasos de muestreo.
- Prototipado rápido de prompts en local: el runner acepta prompt, resolución, pasos y semilla por línea de comandos, lo que facilita iterar sobre descripciones sin depender de servicios en la nube.
- Reproducción determinista de resultados: la semilla fija y la muestra de validación incluida permiten verificar que la instalación funciona correctamente y comparar configuraciones de hardware.
- Despliegue en servidores con GPU NVIDIA existentes: con el plugin OpenVINO NVIDIA instalado, se puede reutilizar una A100 u otra GPU compatible para generar a 512×512 o 1024×1024 sin cambiar el pipeline.
- Integración en pipelines de Diffusers: al seguir el formato de pipeline modular, los componentes pueden encajarse en flujos existentes basados en la librería `diffusers`.
- Evaluación comparativa de cuantización: sirve para medir el impacto cualitativo de INT4/INT8 frente al modelo original en tareas concretas de generación de imagen.
- Generación de imágenes de referencia para documentación técnica o demos internas, siempre que se respeten los términos de la FLUX Kommunity License.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado es una medición puntual del autor: una generación de 1024×1024 a 16 pasos en una Lambda A100 con el plugin OpenVINO NVIDIA tardó 7 minutos y 57 segundos. No hay cifras de latencia para CPU, ni de throughput, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Espacio en disco: aproximadamente 4,96 GiB para el paquete completo (37 archivos), más el espacio de la caché de descarga si se usa el modo remoto.
- VRAM/RAM: no se especifica un mínimo oficial. Por el tamaño del paquete y la cuantización INT4/INT8, es esperable que quepa en equipos con memoria unificada o RAM del orden de los 8-16 GB, pero este dato no está confirmado en la información disponible.
- CPU: es el dispositivo por defecto de OpenVINO; no se indican modelos concretos de CPU Intel validados.
- GPU NVIDIA: validado en una Lambda A100 a 512×512 y 1024×1024, ambos a 16 pasos. Requiere el plugin OpenVINO NVIDIA instalado y registrado.
- GPU Intel: el comportamiento en GPU Intel no ha sido validado de forma independiente según la model card.
- GPU de consumo: no se documenta validación en RTX 4090, RTX 3090 u otras GPU de consumo; no disponible.
- Despliegue: runner propio (`infer.py`) con dependencias fijadas en `requirements.txt`; el pipeline es de tipo Diffusers modular con componentes OpenVINO IR. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de imagen).
- Latencia: 7m57s para 1024×1024 a 16 pasos en A100 con OpenVINO NVIDIA; sin datos para CPU ni para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xgirls/flux-3-klein-openvino-int4-awq | no disponible | 512×512 y 1024×1024 validadas | OpenVINO IR INT4/INT8 | FLUX Kommunity License v1.0 | Hugging Face, repo sin gating |
| black-forest-labs/flux-3-image-klein (original) | no disponible | no disponible | PyTorch / Diffusers | FLUX Kommunity License v1.0 | Hugging Face (modelo base) |
| Otras conversiones OpenVINO de modelos de imagen | no disponible | no disponible | OpenVINO IR | variable | no disponible |

La comparación cuantitativa con alternativas de la misma categoría no está disponible en la información proporcionada. El único punto de referencia directo es el modelo original de Black Forest Labs, del que esta publicación es una conversión, no un modelo distinto en capacidades.

## Limitaciones y advertencias

- Estado "WIP - not ready": el propio autor indica que el paquete no está listo para uso en producción.
- Conversión no oficial: no está avalada ni afiliada a Black Forest Labs ni a Intel; los problemas de calidad deben atribuirse a la conversión, no necesariamente al modelo original.
- Licencia restrictiva: se aplica la FLUX Kommunity License v1.0, que impone condiciones al uso comercial; es necesario revisar `LICENSE.md` y `NOTICE.md` incluidos antes de cualquier despliegue comercial.
- Idiomas: solo se declara inglés; el rendimiento con prompts en castellano u otros idiomas no está documentado.
- Calibración: el transformer exportado está calibrado para prompts de texto-a-imagen; no se garantiza su comportamiento en otras tareas.
- Riesgo de alucinación visual y sesgos: al no publicarse datos de entrenamiento ni evaluaciones, no es posible cuantificar sesgos ni tasas de error; deben asumirse los del modelo base.
- Validación limitada: solo hay muestras de validación con semilla fija a 1024×1024 y pruebas en A100; no hay validación independiente en GPU Intel ni en GPU de consumo.
- Sin datos de parámetros, contexto ni benchmarks: impide comparaciones rigurosas con otros modelos de difusión.
- Repositorio sin gating: cualquiera puede descargarlo, pero eso no exime del cumplimiento de la licencia del modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xgirls/flux-3-klein-openvino-int4-awq
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Licencia FLUX Kommunity License (referenciada en el repo como `LICENSE.md`)
- Aviso legal del modelo original (referenciado como `NOTICE.md`)
- Documentación de Diffusers: https://huggingface.co/docs/diffusers
- OpenVINO: https://docs.openvino.ai
- Plugin OpenVINO NVIDIA: no disponible enlace concreto en la información proporcionada
