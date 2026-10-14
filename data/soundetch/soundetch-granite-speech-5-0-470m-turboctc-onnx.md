# soundetch/soundetch-granite-speech-5.0-470m-turboctc-onnx

## Resumen

SoundEtch Granite Speech 5.0 470M TurboCTC ONNX es una exportacion en formato ONNX del modelo de reconocimiento automatico de voz (ASR) IBM Granite Speech 5.0 TurboCTC de 470 millones de parametros, modificada por el desarrollador SoundEtch para anadir salidas de temporizacion a nivel de fotograma. No se trata de un modelo entrenado ni ajustado de cero: la relacion declarada con el modelo base es `quantized`, y el proceso de SoundEtch no altera los pesos de inferencia originales.

El modelo emplea una arquitectura Conformer con cabecera CTC (Connectionist Temporal Classification), exportada en cuantizacion q4f16 (pesos de 4 bits con activaciones en fp16). Su proposito principal es ejecutar reconocimiento de voz en ingles de forma local, incluyendo en el navegador mediante ONNX Runtime Web sobre los backends WebGPU o WebAssembly, sin necesidad de un endpoint de inferencia alojado.

La relevancia de esta ficha reside en que combina un modelo ASR compacto con un contrato de integracion explicito para despliegue en el cliente: frontend de audio (80 bins log-mel a 16 kHz mono), vocabulario y filtros mel propios, y cuatro salidas ONNX (`frame_ids`, `token_ids`, `ctc_scores` y `vocab_log_probs`) que habilitan temporizacion condicionada por transcripcion. El grafo personalizado no promete ser un reemplazo directo en Transformers o Transformers.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con cabecera CTC (derivada del grafo `ctc_conformer_q4f16.onnx`) |
| Parametros totales | 470M (segun el nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | q4f16 (pesos de 4 bits, activaciones fp16) |
| Idiomas soportados | en (ingles unicamente) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafo `granite_timing_v2_q4f16.onnx` + pesos externos `ctc_conformer_q4f16.onnx.data`) |
| Tamano del repo | 0,3 GB |
| Entrada de audio | mono, 16 kHz, 80 bins log-mel, deltas, stacking y padding segun `frontend_config.json` |
| Entradas ONNX | `input_features`, `padding_mask` |
| Salidas ONNX | `frame_ids`, `token_ids`, `ctc_scores`, `vocab_log_probs` |
| ID de blank (CTC) | 0 |
| Vocabulario (`vocab_log_probs`) | 16.384 dimensiones por fotograma |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Conformer CTC, un modelo acustico que combina convoluciones y auto-atencion para procesar secuencias de audio y emitir predicciones a nivel de fotograma con una cabecera CTC. El artefacto publicado no es un entrenamiento nuevo: SoundEtch parte del grafo ONNX q4f16 exportado por IBM para su Space de navegador, en la revision pinneada `245e1e52c6fc01ba065c35b4af884d89cdca60de`, correspondiente al archivo original `onnx-ctc/ctc_conformer_q4f16.onnx`.

La modificacion introducida consiste en reemplazar ese grafo por un grafo derivado (version de temporizacion `v2`) que anade cuatro salidas: `frame_ids` (IDs greedy por fotograma, incluyendo blanks y repeticiones), `token_ids` (IDs greedy tras colapsar repeticiones CTC), `ctc_scores` (puntuaciones condicionadas para temporizacion) y `vocab_log_probs` (distribucion normalizada sobre el vocabulario no blank). El generador conserva los metadatos y avisos originales de IBM, poda componentes no utilizados, mantiene las ubicaciones de los pesos externos y anade el aviso de modificacion. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens de audio, ni si hubo etapas de RLHF o DPO, por lo que estos datos se consideran no disponibles.

## Capacidades

- Reconocimiento automatico de voz (ASR) en ingles con inferencia local.
- Salida CTC a nivel de fotograma, con IDs greedy por fotograma y tras colapso de repeticiones.
- Puntuaciones CTC (`ctc_scores`) para temporizacion condicionada por transcripcion.
- Distribuciones de vocabulario por fotograma (`vocab_log_probs`, 16.384 dimensiones) para logica de decodificacion y alineamiento propia.
- Ejecucion en navegador mediante ONNX Runtime Web 1.26.0 sobre WebGPU o WebAssembly (backend elegido por la aplicacion consumidora).
- No incluye generacion de timestamps de palabra por si mismo: el alineamiento requiere la logica de decodificacion/alineamiento de SoundEtch.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo ASR, no un LLM de proposito general).
- Sin capacidades de vision, audio generativo ni thinking mode.

## Casos de uso

- Reconocimiento de voz en el navegador: al ejecutarse sobre ONNX Runtime Web con WebGPU/WASM, permite transcribir audio en ingles sin enviar datos a un servidor, util en aplicaciones web con requisitos de privacidad.
- Subtitulado con temporizacion a nivel de fotograma: las salidas `frame_ids` y `ctc_scores` permiten construir alineamientos temporales condicionados por la transcripcion para generar subtitulos sincronizados.
- Transcripcion local en aplicaciones de escritorio o moviles: al no requerir endpoint alojado, el bundle puede empaquetarse dentro de una aplicacion que ejecute la inferencia en el dispositivo.
- Herramientas de accesibilidad (dictado y voz a texto): integrable en editores o interfaces que necesiten transcripcion en ingles en tiempo casi real sobre hardware de consumo.
- Analisis y anotacion de audio a escala: la salida `vocab_log_probs` permite aplicar logica de decodificacion personalizada (por ejemplo, beam search o re-scoring) en pipelines de investigacion en ASR.
- Prototipado de ASR en web sin backend: el contrato de sesion con pesos externos y frontend propio facilita montar demos autocontenidas que corren enteramente en el cliente.
- Investigacion sobre decodificacion CTC y alineamiento: las salidas adicionales de temporizacion sirven para experimentar con estrategias de alineamiento sin modificar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo de pesos externos ocupa 311.533.568 bytes (unos 297 MB); con el grafo y los ficheros de frontend, el bundle total es de 0,3 GB. La huella en memoria es por tanto reducida.
- GPU recomendadas: no disponibles de forma explicita; al ser un modelo de 470M en q4f16, es adecuado para GPU de consumo. Funciona sobre los backends WebGPU y WebAssembly de ONNX Runtime Web.
- Compatibilidad con GPU de consumo: si, por su tamano reducido (0,3 GB de repo) cabe en GPU de consumo y en entornos de navegador, aunque no se especifican modelos concretos.
- Opciones de despliegue: ONNX Runtime Web 1.26.0 (WebGPU o WebAssembly) segun el contrato documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Carga de pesos externos: la sesion debe crearse pasando explicitamente `ctc_conformer_q4f16.onnx.data` mediante `externalData`, con `graphOptimizationLevel: 'all'`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos comparativos frente a otros modelos ASR (parametros, contexto, benchmarks, etc.) que permitan una comparacion rigurosa. Como referencia de categoria, el propio modelo base `ibm-granite/granite-speech-5.0-470m-turboctc` es el origen directo de esta exportacion; no se dispone de especificaciones de terceros alternativos en el material consultado.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles (`language: en`); no soporta otros idiomas.
- No es un modelo entrenado ni ajustado de nuevo: es una cuantizacion/exportacion del modelo base de IBM, por lo que hereda sus limitaciones.
- El grafo personalizado no es un reemplazo directo en Transformers o Transformers.js; requiere la logica de decodificacion y alineamiento de SoundEtch para obtener tiempos de palabra.
- Las salidas de temporizacion no entregan timestamps de palabra por si mismas: requieren el alineamiento externo.
- Riesgo de alucinacion y errores de transcripcion inherentes a los modelos ASR: no disponible informacion especifica sobre tasas de error.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Integridad del bundle: debe descargarse un bundle completo y coincidente desde un commit pinneado. Mezclar revisiones o sustituir las tablas mel de otro modelo rompe el contrato de integracion (se recomienda verificar tamanos y hashes SHA-256).
- La atribucion a IBM no implica respaldo de IBM hacia esta exportacion.
- Licencia Apache 2.0: permite uso comercial, pero el bundle debe acompanarse de `LICENSE` y `NOTICE` con el aviso de modificacion correspondiente.
- No se proporciona endpoint de inferencia alojado; toda la inferencia es local.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soundetch/soundetch-granite-speech-5.0-470m-turboctc-onnx
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Space de IBM (origen de los activos): https://huggingface.co/spaces/ibm-granite/granite-speech-streaming-webgpu
- Revision pinneada de los activos ONNX: https://huggingface.co/spaces/ibm-granite/granite-speech-streaming-webgpu/tree/245e1e52c6fc01ba065c35b4af884d89cdca60de/onnx-ctc
- Discusion sobre licencia de IBM: https://huggingface.co/spaces/ibm-granite/granite-speech-streaming-webgpu/discussions/2#6acd6c17d02d2f46a7b4ae77
