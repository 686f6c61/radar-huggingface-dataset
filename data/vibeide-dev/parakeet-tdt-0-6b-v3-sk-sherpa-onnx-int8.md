# vibeide-dev/parakeet-tdt-0.6b-v3-sk-sherpa-onnx-int8

## Resumen

Este modelo es una exportacion cuantizada en formato ONNX (int8) del modelo de reconocimiento automatico de habla parakeet-tdt-0.6b-v3-sk, un ajuste fino para eslovaco del Parakeet TDT 0.6B v3 de NVIDIA, realizado por el equipo KInIT (Kempelen Institute of Intelligent Technologies). La cuantizacion y el empaquetado para sherpa-onnx fueron realizados por vibeide-dev, con el objetivo de habilitar dictado por voz local en la aplicacion de escritorio VibeiDE, un orquestador de sesiones de Codex y Claude Code.

El problema que resuelve es doble: por un lado, ofrece reconocimiento de voz en eslovaco con precision muy superior al modelo base multilingue (6,3% de WER frente a un 15-17% en una prueba de sanidad sobre FLEURS sk_sk); por otro, permite ejecutar la inferencia completamente en local y en dispositivo, sin que el audio salga del ordenador del usuario, gracias al formato ONNX int8 y al runtime sherpa-onnx. La arquitectura subyacente es un transductor TDT (Token-and-Duration Transducer) basado en NeMo, con unos 0,6 mil millones de parametros, y es relevante ahora porque la demanda de ASR local, privado y de baja latencia sigue creciendo en aplicaciones de escritorio y dictado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor TDT (Token-and-Duration Transducer) de NeMo, tipo Parakeet |
| Parametros totales | ~0,6 mil millones (0,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada de 80 dimensiones mel a 16 kHz) |
| Tipos de cuantizacion | int8 dinamico (QUInt8 en el encoder, QInt8 en decoder y joiner) |
| Idiomas soportados | Eslovaco (sk); otros idiomas degradan el rendimiento |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx, tokens.txt) |

## Arquitectura y entrenamiento

El modelo base, parakeet-tdt-0.6b-v3 de NVIDIA, es un transductor TDT implementado en el framework NeMo. Los transductores TDT combinan un encoder acustico con un predictor de tokens y un modulo de duracion, lo que permite decodificacion por greedy search sin necesidad de un lenguaje externo, con buena gestion de la alineacion temporal. La variante eslovaca fue ajustada por KInIT a partir del checkpoint base, sin modificar la arquitectura ni el tokenizador.

En cuanto a la exportacion, el proceso consistio en: restaurar el checkpoint `.nemo` de KInIT (revision `45003b0f...`, verificada por SHA-256) con NeMo 2.7.3; exportar la rama transductora con el script oficial de k2-fsa (`export_onnx.py`, con torch 2.6.0, onnx 1.17.0 y onnxruntime 1.17.1); y aplicar cuantizacion int8 dinamica mediante `quantize_dynamic`. No se modificaron pesos y el tokenizador es identico al del modelo base. Los datos de entrenamiento del ajuste fino eslovaco no estan detallados en la ficha; solo se indica que consisten mayoritariamente en emisiones cortas y que pueden solaparse con el conjunto de evaluacion FLEURS sk_sk.

## Capacidades

- Reconocimiento automatico de habla (ASR) offline en eslovaco, con transcripcion de texto a partir de audio a 16 kHz.
- Decodificacion greedy search sin modelo de lenguaje externo, gracias a la arquitectura transductora TDT.
- Inferencia en dispositivo mediante sherpa-onnx, sin envio de audio a la nube (privacidad total).
- Ejecucion eficiente en CPU gracias a la cuantizacion int8 dinamica (configuracion de ejemplo con 4 hilos).
- Integrable en aplicaciones de escritorio como entrada de voz (caso de uso original: dictado en VibeiDE).
- No soporta vision, audio generativo, tool calling ni razonamiento: es un modelo especializado unicamente en ASR.

## Casos de uso

- Dictado por voz local en aplicaciones de escritorio: el caso de uso original en VibeiDE; el usuario habla y el texto se inserta en el editor sin conexion, con el audio nunca saliendo del equipo.
- Transcripcion de notas de voz en eslovaco: ideal para convertir grabaciones cortas de audio en texto dentro de apps moviles o de escritorio, dado que el entrenamiento se baso en emisiones cortas.
- Subtitulado offline de contenido en eslovaco: puede integrarse en pipelines de procesamiento de video locales para generar transcripciones sin coste de API ni dependencia de red.
- Asistentes de voz con requisitos de privacidad: sistemas que procesan comandos de voz en eslovaco sin enviar datos a servicios externos, por ejemplo en entornos sanitarios o legales.
- Integracion en pipelines de datos de habla: pretranscripcion masiva de corpus de audio en eslovaco en servidores CPU, aprovechando el bajo consumo del modelo int8.
- Accesibilidad: herramientas de dictado para usuarios con dificultades de escritura en eslovaco, ejecutandose en hardware de consumo sin GPU.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks oficiales completos. El unico dato publicado es una prueba de sanidad del propio autor de la exportacion:

| Benchmark | Este modelo (int8) | Base Parakeet v3 (export int8) |
|---|---|---|
| WER en FLEURS sk_sk dev (60 clips) | 6,3% | 15-17% |

Advertencias: la muestra es muy pequena (60 clips) y los datos de entrenamiento de KInIT pueden solaparse con FLEURS, por lo que el WER real en datos independientes podria ser peor. No se han publicado resultados en otros benchmarks estandar.

## Requisitos de hardware

- Tamano total del modelo: ~0,7 GB en disco (encoder.int8.onnx de ~652 MB, decoder de ~12 MB, joiner de ~6 MB, tokens.txt de ~94 KB).
- VRAM/RAM estimada: cabe comodamente en la RAM de cualquier equipo moderno; al ser ONNX con sherpa-onnx puede ejecutarse solo en CPU, sin GPU dedicada.
- GPU recomendadas: no necesaria; opcionalmente acelera en GPU via onnxruntime, pero no se publican cifras.
- Consumer GPU: no requiere GPU; cualquier CPU moderna con 4 hilos disponibles es suficiente segun la configuracion de ejemplo.
- Despliegue: sherpa-onnx (offline recognizer, tipo `nemo_transducer`) en escritorio, movil o servidor; compatible con bindings de sherpa-onnx para multiples lenguajes (el ejemplo de la ficha usa JavaScript/WASM).
- Latencia y throughput: no se publican cifras concretas; al ser un modelo de 0,6B cuantizado a int8 con decodificacion greedy, la inferencia en CPU es en tiempo real o mejor, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| vibeide-dev/parakeet-tdt-0.6b-v3-sk-sherpa-onnx-int8 | ~0,6B | Eslovaco | int8 dinamico | CC-BY-4.0 | Export ONNX para sherpa-onnx; WER 6,3% en FLEURS sk_sk |
| kinit/parakeet-tdt-0.6b-v3-sk | ~0,6B | Eslovaco | fp32 (NeMo) | CC-BY-4.0 | Ajuste fino original de KInIT, formato .nemo |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6B | Multilingue (25 idiomas europeos) | fp32 (NeMo) | CC-BY-4.0 | Modelo base de NVIDIA; WER 15-17% en eslovaco |
| csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 | ~0,6B | Multilingue | int8 | CC-BY-4.0 | Export de referencia con el mismo layout encoder/decoder/joiner |

## Limitaciones y advertencias

- Solo eslovaco: el rendimiento en otros idiomas se degrada significativamente, heredado del ajuste fino de KInIT.
- Los datos de entrenamiento contienen mayoritariamente emisiones cortas, por lo que el rendimiento en audio largo o continuo no esta verificado.
- Posible solapamiento entre los datos de entrenamiento de KInIT y FLEURS sk_sk, lo que podria inflar el WER de 6,3% reportado; la muestra de evaluacion es de solo 60 clips.
- La cuantizacion int8 dinamica puede introducir una ligera perdida de precision respecto al modelo fp32 original; no se publica una comparacion directa.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribucion a KInIT, NVIDIA y vibeide-dev.
- Riesgo de alucinaciones tipico de transductores en silencios o audio ruidoso (repeticiones de tokens); no se documentan mitigaciones en la ficha.
- Metricas de sesgo, datos demograficos de entrenamiento y rendimiento por hablante: no disponibles.

## Enlaces

- Ficha del modelo: https://huggingface.co/vibeide-dev/parakeet-tdt-0.6b-v3-sk-sherpa-onnx-int8
- Modelo base ajustado (KInIT): https://huggingface.co/kinit/parakeet-tdt-0.6b-v3-sk
- Modelo base original (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Export de referencia con el mismo layout: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Script de exportacion ONNX: https://github.com/k2-fsa/sherpa-onnx/blob/master/scripts/nemo/parakeet-tdt-0.6b-v3/export_onnx.py
- Aplicacion que lo utiliza (VibeiDE): https://vibeide.dev
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
