# Xylolabs/supertonic-3-Tenstorrent-Tensix-Components

## Resumen

Supertonic 3 prepared components for Tenstorrent Tensix es un archivo parcial de tensores derivado del modelo de síntesis de voz Supertone/supertonic-3, preparado por Xylolabs para su uso en hardware Tenstorrent Tensix. No se trata de un modelo autónomo, sino de un conjunto de componentes (encoder de texto y grupos de vector-estimator/vocoder) convertidos a safetensors portables con almacenamiento BF16 y matrices BFP8 en el vector-estimator. El archivo está pensado para integrarse en un runtime externo que aporte la arquitectura original, el preprocesado de texto y la gestión de ruido, duración y máscaras.

El paquete cubre un encoder de texto de 64 tokens y tres configuraciones latentes (32, 48 y 64 frames), con condicionamiento F1 y constantes de cuatro pasos fijados. Los pesos nativos suman 565.576.704 bytes (unos 0,57 GB) y el repositorio ocupa 0,7 GB. La licencia es OpenRAIL-M heredada del modelo base, lo que impone restricciones de uso y distribución.

Su relevancia es acotada pero específica: permite a desarrolladores que trabajan con aceleradores Tenstorrent disponer de operadores ya preparados y verificados (repacking TT-NN 0.81.1, comprobación de hashes y formas) sin tener que reproducir el proceso de conversión desde ONNX. No sustituye al modelo completo ni incluye evaluación de síntesis de voz de extremo a extremo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (componentes de un modelo TTS; encoder de texto y vector-estimator/vocoder) |
| Parámetros totales | no disponible (pesos nativos: 565.576.704 bytes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (encoder de texto limitado a 64 tokens) |
| Tipos de cuantización | BF16 (1.332 operandos) y BFP8 round-to-nearest (168 matrices pointwise del vector-estimator); BFP8 = 8,5 bits por valor empaquetado |
| Idiomas soportados | ko (coreano) |
| Licencia | OpenRAIL-M (BigScience OpenRAIL-M, heredada del modelo base); el loader de Xylolabs es Apache 2.0 |
| Formato de pesos | safetensors (BF16 en contenedor portable; 1.500 tensores portables) |

## Arquitectura y entrenamiento

El archivo no contiene un modelo entrenado de novo, sino tensores operadores derivados de Supertone/supertonic-3, capturados desde una configuración fija de F1 y cuatro pasos. La estructura interna incluye un encoder de texto de 64 tokens (`text_t64`, 138 tensores) y, para cada bucket latente de 32, 48 y 64 frames, un grupo vector-estimator (`ve_t64_l32`, `ve_t64_l48`, `ve_t64_l64`, con 369 tensores cada uno) y un vocoder (`voc_t64_l32`, `voc_t64_l48`, `voc_t64_l64`, con 85 tensores cada uno). Los tamaños portables por componente van de 34,5 MB (encoder de texto) a 151,9 MB (vector-estimator de 64 frames).

La preparación conserva las escalas de query y rotación, el escalado por paso, la normalización/gamma y las tablas originales. Las 168 matrices pointwise del vector-estimator mantienen exactamente los valores BFP8 con redondeo al más cercano; el resto de operandos son BF16. La evaluación reportada incluye que todos los tensores son finitos, que sobreviven al repacking nativo de TT-NN 0.81.1 en simulador, que los checksums de transporte y los snapshots de origen pasan, y que los cuatro ONNX principales coinciden con las identidades LFS oficiales. Se documenta una discrepancia de procedencia: la reconstrucción independiente de cuatro tablas de style-key difiere como máximo 9,016e-7 en FP32, cruzando límites BF16 en cinco coeficientes por bucket latente; el archivo preserva los valores fuente existentes.

## Capacidades

- Suministro de tensores preparados para un encoder de texto de 64 tokens en hardware Tenstorrent Tensix.
- Suministro de grupos vector-estimator y vocoder para tres resoluciones latentes (32, 48 y 64 frames).
- Carga selectiva por componente mediante `load_components.py`, con verificación de hashes, nombres, formas, dtypes declarados y valores finitos.
- Compatibilidad con repacking nativo TT-NN 0.81.1 en contexto de simulador.
- No incluye síntesis de voz autónoma: no hay forward TTS completo ni evaluación de escucha asociada a este archivo.
- No incluye preprocesado de texto, predicción de duración, gestión de ruido/longitud ni máscaras, shifts e inputs posicionales por frase; todo ello debe aportarse por separado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Cobertura lingüística limitada al coreano (ko) según los metadatos.

## Casos de uso

- Integración en un runtime TTS sobre Tenstorrent: usar los tensores `text_t64` y el bucket latente adecuado como base para construir un pipeline de síntesis de voz en aceleradores Tensix, aportando la arquitectura y el adaptador de operadores compatible.
- Portado y validación de operadores: emplear `load_components.py` para verificar hashes, formas y dtypes antes de integrar los pesos en un grafo TT-NN, reduciendo el trabajo de conversión desde ONNX.
- Investigación en cuantización híbrida: estudiar el efecto de mantener 168 matrices en BFP8 (8,5 bits por valor) frente a BF16 en el resto de operandos, con un ahorro de memoria medible en el vector-estimator.
- Reproducibilidad de conversiones: comparar los tensores preservados con reconstrucciones independientes de las tablas de style-key, documentando la discrepancia máxima de 9,016e-7 en FP32 como cota de procedencia.
- Desarrollo de vocoders en hardware especializado: usar los grupos `voc_t64_l32`, `voc_t64_l48` y `voc_t64_l64` para experimentar con distintas resoluciones latentes en el decodificador de audio.
- Evaluación de despliegue en simulador: probar el repacking nativo TT-NN 0.81.1 y el consumo de memoria (unos 0,57 GB solo en pesos, más buffers de trabajo) antes de comprometer hardware real.
- Base para pipelines multilingües futuros: aunque el modelo está etiquetado solo en coreano, los componentes pueden servir de referencia para adaptaciones a otros idiomas siempre que se respete la licencia OpenRAIL-M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se asigna ninguna evaluación completa de forward TTS ni de escucha a este archivo independiente, y que no se reporta velocidad. Los únicos datos cuantitativos son de verificación: 1.500 tensores portables, 565.576.704 bytes nativos, repacking exacto en TT-NN 0.81.1 y discrepancia máxima de 9,016e-7 en FP32 en cuatro tablas de style-key.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: aproximadamente 0,57 GB solo para los pesos de los componentes, más espacio para buffers de trabajo (cifra no desglosada en la información disponible).
- Hardware objetivo: aceleradores Tenstorrent Tensix; la evaluación de repacking se realizó en contexto de simulador con TT-NN 0.81.1.
- GPU consumer: no aplica de forma nativa; el archivo está orientado a Tensix, aunque los safetensors BF16 pueden inspeccionarse en PyTorch en cualquier equipo con suficiente memoria.
- Opciones de despliegue: carga mediante PyTorch, safetensors y huggingface_hub con `load_components.py`; la integración requiere un adaptador de operadores y la arquitectura original de Supertonic 3.
- Latencia y throughput: no disponibles; la model card indica que la velocidad no se reporta en este archivo.
- Almacenamiento: repositorio de 0,7 GB; descarga selectiva posible con `allow_patterns` para traer solo los componentes necesarios.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Xylolabs/supertonic-3-Tenstorrent-Tensix-Components | Componentes TTS para Tensix | no disponible (0,57 GB de pesos) | encoder de 64 tokens | ko | OpenRAIL-M | Hugging Face |
| Supertone/supertonic-3 | Modelo TTS base completo | no disponible | no disponible | ko | no disponible en la información | Hugging Face |
| Otros modelos TTS comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento ni especificaciones de alternativas que permitan una comparación cuantitativa fiable. La comparación principal es con el modelo base Supertone/supertonic-3, del que este archivo es una derivación parcial y no un sustituto funcional.

## Limitaciones y advertencias

- No es un modelo autónomo: no genera voz por sí mismo; requiere arquitectura, preprocesado de texto, predicción de duración, gestión de ruido/longitud y máscaras por separado.
- Cobertura lingüística limitada al coreano según los metadatos; no hay evidencia de soporte multilingüe.
- Condicionamiento F1 y constantes de cuatro pasos fijados: no admite variación de estos parámetros sin trabajo adicional.
- Discrepancia de procedencia documentada: la reconstrucción independiente de cuatro tablas de style-key difiere hasta 9,016e-7 en FP32 (cinco coeficientes por bucket cruzan límites BF16); el archivo preserva los valores fuente, no los reconstruidos.
- Sin evaluación de escucha ni de forward TTS completo: el rendimiento perceptual y la calidad de audio no están verificados para este archivo.
- Licencia OpenRAIL-M con condiciones vinculantes de uso y distribución (párrafo 5 y Anexo A); los destinatarios deben recibir la licencia y el aviso de restricciones. El loader de Xylolabs es Apache 2.0, pero los pesos no.
- Riesgo de alucinación y sesgos: no aplica en el sentido de un LLM, pero la calidad y fidelidad de la voz dependen del modelo base y de la integración, no evaluadas aquí.
- Sin datos de latencia ni throughput: no apto para planificación de producción sin mediciones propias.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/supertonic-3-Tenstorrent-Tensix-Components
- Modelo base: https://huggingface.co/Supertone/supertonic-3
- Loader de componentes: https://huggingface.co/Xylolabs/supertonic-3-Tenstorrent-Tensix-Components/blob/main/load_components.py
- Licencia: https://huggingface.co/Xylolabs/supertonic-3-Tenstorrent-Tensix-Components/blob/main/LICENSE
- Repositorio de código Tensix BFP GPTQ: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
