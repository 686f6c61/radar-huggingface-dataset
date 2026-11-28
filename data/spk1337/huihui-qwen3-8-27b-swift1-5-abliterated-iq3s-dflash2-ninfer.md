# SPK1337/Huihui-Qwen3.8-27B-Swift1.5-Abliterated-IQ3S-DFlash2-NInfer

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una conversión y combinación de componentes publicada por el usuario SPK1337 sobre el modelo base Qwen/Qwen3.8-27B. El artefacto resultante, en formato propietario NInfer v3 (`.ninfer`, con bloques GGUF), fusiona los pesos de texto de la variante Huihui abliterated Swift-1.5 cuantizados en GSQ-RCO IQ3_S (incluyendo MTP), un drafter DFlash2 preentrenado de Qwen3.8-27B para decodificación especulativa y el proyector de visión del modelo original. El objetivo es ejecutar un modelo multimodal de 27B en una única GPU consumer de 24 GB de VRAM.

La relevancia del artefacto es fundamentalmente práctica: empaqueta en un solo fichero de aproximadamente 13,99 GiB un modelo de 27B con visión, decodificación especulativa y MTP, pensado para el motor de inferencia NInfer-all RTX 4090 (C++/CUDA, `sm_89`, CUDA 13.4) bajo Windows x64. El autor reporta hasta 229,04 tokens/s de salida en una prueba de decodificación de 2.048 tokens con entrada de 32K, y 191,78 tokens/s con entrada de 160K, medidas en cliente sobre el servidor completo y no como aceleración aislada de DFlash2.

Conviene subrayar que se trata de una conversión de comunidad, no de un modelo nuevo: la calidad final depende enteramente de los modelos upstream (Qwen3.8-27B, la versión abliterated de Huihui y el drafter DFlash2). El artefacto no es un checkpoint estándar de Transformers y no puede cargarse con `transformers.AutoModel.from_pretrained`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.8-27B); artefacto combinado con decodificacion especulativa DFlash2 y MTP |
| Parametros totales | 27B (segun denominacion del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma explicita; los benchmarks del autor usan entradas de 32K y 160K |
| Tipos de cuantizacion | IQ3_S con esquema GSQ-RCO y formatos de bloque mixtos |
| Idiomas soportados | en, zh, de |
| Licencia | Apache-2.0 (preservando avisos upstream) |
| Formato de pesos | NInfer v3 `.ninfer` con bloques GGUF (`gguf_blocks_v1`); no compatible con Transformers |

## Arquitectura y entrenamiento

El artefacto es una combinacion de componentes, no un entrenamiento nuevo. Los pesos de texto proceden de la variante Huihui abliterated Swift-1.5, cuantizados en IQ3_S con el esquema GSQ-RCO y formatos de bloque mixtos, e incluyen MTP (multi-token prediction). A ello se suma un drafter DFlash2 preentrenado de Qwen3.8-27B para decodificacion especulativa y el proyector de vision del Qwen3.8-27B original, lo que habilita la modalidad image-text-to-text. DFlash2 y MTP se seleccionan uno a la vez al arrancar el servidor.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; esos datos corresponden al modelo base Qwen3.8-27B y no se detallan en la informacion proporcionada. La innovacion tecnica destacable es el empaquetado en un unico fichero de ~13,99 GiB que combina cuantizacion agresiva, decodificacion especulativa y vision para caber en 24 GB de VRAM.

## Capacidades

- Generacion de texto y razonamiento conversacional, heredados del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto (pipeline image-text-to-text): el proyector de vision esta incluido y debe habilitarse explicitamente en tiempo de ejecucion.
- Decodificacion especulativa mediante DFlash2 y prediccion multi-token (MTP), seleccionables de forma mutua al arrancar el servidor.
- Servidor con API compatible con OpenAI (mencionado en las etiquetas y en la model card).
- Monitor integrado en la pagina `/monitor` del servidor local para inspeccionar uso de GPU, VRAM, temperatura, throughput, tasa de aceptacion de DFlash2 y ocupacion de KV.
- Capacidades multilingues limitadas a ingles, chino y aleman.
- Variante "abliterated" y "uncensored": se han atenuado los mecanismos de rechazo del modelo original.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en una RTX 4090: el artefacto esta dimensionado (~13,99 GiB) para ejecutarse en 24 GB de VRAM con el motor NInfer-all RTX 4090, lo que permite desplegar un modelo de 27B con vision en una estacion de trabajo Windows sin GPU de centro de datos.
- Procesamiento de documentos con imagenes: al incluir el proyector de vision, puede emplearse para tareas image-text-to-text como descripcion de capturas, extraccion de informacion de figuras o analisis de documentos escaneados, habilitando la vision en el arranque del servidor.
- Generacion de texto a alta velocidad en local: con DFlash2 y MTP activos, el autor reporta hasta 229,04 tokens/s de salida con entrada de 32K, adecuado para asistentes interactivos y generacion de borradores donde la latencia percibida importa.
- Contextos largos en local: las pruebas con entrada de 160K y 191,78 tokens/s sugieren uso en resumen y analisis de documentos extensos, siempre que se valide la ventana de contexto real del modelo base.
- Integracion via API compatible con OpenAI: el servidor expone una API local que permite conectar herramientas existentes (clientes, scripts, orquestadores) sin reescribir integraciones, util para prototipado rapido en entornos de desarrollo.
- Experimentacion con modelos sin censura: la variante abliterated resulta de interes para investigacion sobre comportamiento de modelos y para tareas creativas o de analisis donde los rechazos del modelo original son un obstaculo, asumiendo los riesgos asociados.
- Monitorizacion y ajuste de rendimiento: la pagina `/monitor` integrada facilita perfilar VRAM, temperatura y tasa de aceptacion de DFlash2 durante el desarrollo de aplicaciones locales.

## Benchmarks y rendimiento

Los unicos datos disponibles son mediciones del autor en una RTX 4090 (19 de octubre de 2026), medidas en cliente sobre el servidor completo y no como aceleracion aislada de DFlash2:

| Prueba | Resultado |
|---|---|
| Decodificacion, 2.048 tokens de salida, entrada 32K | hasta 229,04 tokens/s |
| Entrada 160K | 191,78 tokens/s |
| Solicitudes HTTP | 63/63 correctas |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor advierte que los workloads y builds difieren respecto al artefacto relacionado sin Swift 1.5, por lo que no establecen una clasificacion directa de velocidad o calidad.

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa ~13,99 GiB en disco; el autor lo orienta a GPUs de 24 GB de VRAM, por lo que se recomienda reservar el resto para contexto KV y vision.
- GPU objetivo: NVIDIA Ada Lovelace con `sm_89`; el caso documentado es la RTX 4090 bajo Windows x64 con CUDA 13.4.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB); para otras consumer no hay datos disponibles.
- Opciones de despliegue: NInfer-all RTX 4090 (binarios portables Windows x64, sin necesidad de CUDA Toolkit) o una build upstream de NInfer-all que soporte bloques GGUF y DFlash2. No es compatible con vLLM, llama.cpp, Ollama ni TGI segun la informacion disponible.
- Throughput: hasta 229,04 tokens/s de salida con entrada de 32K y 191,78 tokens/s con entrada de 160K, segun el autor.
- El paquete incluye una verificacion de humo en GPU real que no certifica todas las variantes ni garantiza una aceleracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Este artefacto (SPK1337) | 27B | no disponible (pruebas hasta 160K) | Si | Apache-2.0 | `.ninfer` (bloques GGUF) / NInfer-all |
| Huihui-Qwen3.8-27B-Uncensored-GSQ-RCO-IQ3S-Vision-DFlash2-MTP-NInfer (SPK1337) | 27B | no disponible | Si | Apache-2.0 | `.ninfer` / NInfer-all |
| Qwen/Qwen3.8-27B | 27B | no disponible | Si | no disponible | safetensors / Transformers |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF | 27B | no disponible | no disponible | no disponible | GGUF |

El artefacto relacionado del mismo autor (~13,99 GiB, con DFlash2, MTP y vision opcional) es la alternativa mas directa; su informe historico cubre 1.831 solicitudes completadas. No hay datos de rendimiento comparables entre ambos.

## Limitaciones y advertencias

- Es una conversion de comunidad, no un modelo entrenado; la calidad depende de los componentes upstream y no hay evaluacion independiente publicada.
- La variante abliterated elimina mecanismos de rechazo, lo que aumenta el riesgo de contenido inapropiado, danino o sesgado; no es adecuada para produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para este artefacto.
- Idiomas limitados a ingles, chino y aleman; el castellano no figura entre los idiomas soportados.
- La longitud de contexto real no se documenta de forma explicita; las pruebas con 160K no garantizan calidad a esa ventana.
- No es un checkpoint estandar de Transformers y no funciona con vLLM, llama.cpp, Ollama ni TGI; requiere NInfer-all y, en el caso documentado, Windows x64 con GPU `sm_89`.
- DFlash2 y MTP son mutuamente excluyentes en el arranque del servidor; no pueden usarse simultaneamente.
- La licencia Apache-2.0 se hereda, pero deben preservarse los avisos upstream; conviene revisar las condiciones de los modelos base.
- El rendimiento reportado son mediciones en cliente de todo el servidor en un unico hardware y workload, no una garantia general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SPK1337/Huihui-Qwen3.8-27B-Swift1.5-Abliterated-IQ3S-DFlash2-NInfer
- Modelo relacionado (sin Swift 1.5): https://huggingface.co/SPK1337/Huihui-Qwen3.8-27B-Uncensored-GSQ-RCO-IQ3S-Vision-DFlash2-MTP-NInfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Base abliterated GGUF: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Portal del proyecto NInfer RTX 4090: https://spk-c.github.io/ninfer-all-rtx4090/
- Configurador de VRAM: https://spk-c.github.io/ninfer-all-rtx4090/configurator.html
- Benchmarks reproducibles: https://spk-c.github.io/ninfer-all-rtx4090/benchmarks.html
- Guia del monitor: https://spk-c.github.io/ninfer-all-rtx4090/monitor.html
- Codigo fuente: https://github.com/spk-c/ninfer-all-rtx4090
- Binarios Windows: https://github.com/spk-c/ninfer-all-rtx4090/releases/latest
- Guia de ajuste en RTX 4090: https://github.com/spk-c/ninfer-all-rtx4090/blob/master/docs/rtx4090.md
- NInfer-all upstream: https://github.com/iamwavecut/ninfer-all
