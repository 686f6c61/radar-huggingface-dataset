# Xylolabs/KORMo-Web-11B-GGUF

## Resumen

KORMo-Web-11B-GGUF es la versión cuantizada en formato GGUF del modelo multimodal KORMo-Web-11B, desarrollado originalmente por KAIST MLP Lab y convertido a GGUF por Xylolabs. Se trata de un modelo de tipo image-text-to-text especializado en interacción con interfaces web y agentes GUI: recibe capturas de pantalla o imágenes de páginas junto con instrucciones en lenguaje natural y genera respuestas o acciones. Con 10.756.624.384 parámetros (aproximadamente 10,76 mil millones), está pensado para ejecutarse localmente mediante llama.cpp en CUDA, Metal o CPU.

La relevancia de esta ficha radica en que permite desplegar un agente web multimodal de ~11B en hardware de consumo, algo poco habitual en modelos de esta categoría. El repositorio incluye ocho niveles de cuantización (desde Q8_0 de 11,44 GB hasta IQ3_M de 4,98 GB), dos proyectores de visión (F16 y Q8_0) y una importance matrix para cuantización con imatrix. El modelo soporta coreano e inglés, emplea licencia Apache-2.0 y activa por defecto un modo de razonamiento (thinking) que puede desactivarse por parámetro.

La versión GGUF requiere aplicar un parche específico (`llava-onevision.patch`) sobre un commit concreto de llama.cpp para que el proyector de visión funcione, lo que condiciona su integración en producción. El modelo base es KORMo-VL/KORMo-Web-11B y esta conversión no está afiliada ni respaldada por KAIST MLP Lab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; el repositorio no detalla la arquitectura interna) |
| Parametros totales | 10.756.624.384 (~10,76 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en los comandos de ejemplo con `-c 32768`) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, IQ3_M; proyectores de visión en F16 y Q8_0 |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyectores mmproj en GGUF |

## Arquitectura y entrenamiento

El repositorio no proporciona detalles sobre la arquitectura interna del modelo base (tipo de transformer, composición del dataset, número de tokens de entrenamiento ni si hubo RLHF/DPO). Lo que sí se documenta es que se trata de un modelo multimodal image-text-to-text con un proyector de visión separado, empaquetado como `mmproj-KORMo-Web-11B-F16.gguf` (871,52 MB) o `mmproj-KORMo-Web-11B-Q8_0.gguf` (592,85 MB). El proyector sigue el esquema llava-onevision, de ahí que sea necesario aplicar `llava-onevision.patch` sobre el commit `e4b620af19f02960dea7a3a81de7c5805aa3a333` de llama.cpp para habilitar la entrada visual.

En cuanto al proceso de cuantización, Xylolabs publica una importance matrix (`KORMo-Web-11B.imatrix.gguf`, 13,23 MB) y métricas de fidelidad frente a BF16: divergencia KL media y acuerdo top-1 sobre tres conjuntos (WikiText-2, chat y held-out). Los archivos Q6_K, Q5_K_M, Q4_K_M y Q4_K_S fueron reconstruidos el 2026-11-20, y el IQ3_M se rehízo el 2026-11-22 con menor tamaño (4,98 GB) y mejores métricas. El modelo activa por defecto el modo thinking, que puede desactivarse con `--chat-template-kwargs '{"enable_thinking":false}'`.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes (capturas de pantalla, páginas web) junto con instrucciones textuales.
- Agente web y GUI: etiquetado explícito como `gui-agent` y `web-agent`, orientado a interpretar interfaces y decidir acciones.
- Modo thinking activado por defecto, desactivable mediante parámetro de plantilla de chat.
- Conversación multi-turno (`conversational` en los tags).
- Soporte de plantilla de chat Jinja (`--jinja` en los comandos de ejemplo).
- Capacidades multilingües limitadas a coreano e inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de audio: no disponible.

## Casos de uso

- Automatización de tareas web: el modelo puede recibir una captura de pantalla de una página y una instrucción ("rellena este formulario", "encuentra el botón de envío") y devolver la descripción o acción correspondiente, gracias a su naturaleza de agente GUI y a su proyector de visión llava-onevision.
- Testing de interfaces: integrado en pipelines de QA para describir el estado visual de una página y detectar regresiones de UI comparando capturas con la respuesta esperada.
- Asistencia a usuarios en coreano e inglés: despliegue local en atención al cliente que necesite interpretar capturas enviadas por el usuario y responder en su idioma.
- Extracción de información de documentos visuales: dado que procesa imágenes, puede describir el contenido de una página o documento renderizado como imagen mediante `llama-mtmd-cli --image page.png`.
- Despliegue en hardware de consumo: con la cuantización IQ3_M (4,98 GB) o Q4_K_M (6,56 GB) cabe en GPUs de consumo, lo que permite prototipar agentes web sin infraestructura cloud.
- Investigación sobre agentes multimodales: al estar en Apache-2.0 y en GGUF, sirve como base reproducible para experimentos de razonamiento visual en local con llama.cpp.
- Procesamiento por lotes en CPU: llama.cpp permite ejecutar el modelo sin GPU, útil para tareas de descripción de páginas a baja escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de cuantización frente a BF16 (divergencia KL media, menor es mejor; y acuerdo top-1):

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 | 11,44 GB | 0,001357 | 98,30% | 0,004699 | 98,40% | 0,000973 | 98,52% |
| Q6_K | 8,83 GB | 0,002771 | 97,58% | 0,006418 | 97,77% | 0,002077 | 97,82% |
| Q5_K_M | 7,66 GB | 0,006964 | 95,99% | 0,010319 | 96,52% | 0,004865 | 96,88% |
| Q4_K_M | 6,56 GB | 0,016915 | 94,06% | 0,028158 | 94,45% | 0,013323 | 94,48% |
| Q4_K_S | 6,23 GB | 0,022264 | 93,11% | 0,034518 | 93,80% | 0,017122 | 93,84% |
| IQ4_XS | 5,90 GB | 0,027927 | 92,33% | 0,042670 | 92,99% | 0,021583 | 92,86% |
| Q3_K_M | 5,31 GB | 0,051346 | 89,69% | 0,070909 | 90,91% | 0,038036 | 90,66% |
| IQ3_M | 4,98 GB | 0,085897 | 87,25% | 0,127902 | 87,67% | 0,067227 | 88,11% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más el proyector de visión. Con Q4_K_M (6,56 GB) y mmproj F16 (871,52 MB) se ronda los 7,5 GB; con IQ3_M (4,98 GB) y mmproj Q8_0 (592,85 MB), unos 5,6 GB.
- GPU recomendadas: el repositorio cita compilación con `-DGGML_CUDA=ON` para NVIDIA y soporte de Metal; no se especifican modelos concretos de GPU.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M o IQ3_M en tarjetas con 8 GB o más de VRAM.
- Opciones de despliegue: llama.cpp (`llama-server` y `llama-mtmd-cli`) con el parche `llava-onevision.patch` aplicado sobre el commit `e4b620af19f02960dea7a3a81de7c5805aa3a333`. No se mencionan vLLM, Ollama ni TGI en la información disponible.
- Contexto en ejecución: los comandos de ejemplo usan `-c 32768` y `-ngl 99`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (agentes web multimodales de ~11B) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Idiomas limitados a coreano e inglés; no se documenta soporte de castellano.
- No hay benchmarks estándar publicados, por lo que el rendimiento en tareas de razonamiento, código o matemáticas no está verificado.
- El proyector de visión exige aplicar un parche a un commit concreto de llama.cpp; sin él, solo funciona el modelo de texto. Esto complica la integración y el mantenimiento en producción.
- El modo thinking está activado por defecto y añade latencia si no se desactiva explícitamente.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a modelos generativos sin métricas publicadas.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero Xylolabs aclara que no está afiliada ni respaldada por KAIST MLP Lab; conviene revisar `NOTICE` y `LICENSE` del repositorio.
- Las cuantizaciones agresivas (IQ3_M, Q3_K_M) degradan notablemente la fidelidad: IQ3_M baja al 87,25% de acuerdo top-1 en WikiText-2 frente al 98,30% de Q8_0.
- El repositorio ocupa 58,4 GB; conviene descargar solo la cuantización necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/KORMo-Web-11B-GGUF
- Modelo base: https://huggingface.co/KORMo-VL/KORMo-Web-11B
- Licencia: https://huggingface.co/Xylolabs/KORMo-Web-11B-GGUF/blob/main/LICENSE
- llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/e4b620af19f02960dea7a3a81de7c5805aa3a333
- Parche de visión: https://huggingface.co/Xylolabs/KORMo-Web-11B-GGUF/resolve/main/llava-onevision.patch
- Repositorio de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
