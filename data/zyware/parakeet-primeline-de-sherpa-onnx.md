# zyware/parakeet-primeline-de-sherpa-onnx

## Resumen

`zyware/parakeet-primeline-de-sherpa-onnx` es una exportación a ONNX en precisión fp32 del modelo `primeline/parakeet-primeline`, un ajuste fino en alemán de `nvidia/parakeet-tdt-0.6b-v3`. El resultado es un paquete listo para su uso con sherpa-onnx como reconocedor de voz offline de tipo transducer TDT (Token-and-Duration Transducer), pensado para ejecutarse en CPU sin GPU. El autor del empaquetado es el usuario `zyware`, y el modelo se emplea en la herramienta de dictado Med-ASR.

La relevancia de este artefacto es fundamentalmente práctica: convierte un checkpoint NeMo `.nemo` en un conjunto de ficheros ONNX (`encoder.onnx` con pesos externos, `decoder.onnx`, `joiner.onnx`), añade los metadatos que sherpa-onnx necesita para habilitar la decodificación TDT y proporciona la tabla de tokens y el vocabulario BPE para el uso de hotwords. No hay reentrenamiento ni cuantización: es una conversión de formato pura.

El modelo cubre únicamente alemán (`de`), con licencia CC BY 4.0 heredada de los modelos originales, y un tamaño de repositorio de 2,5 GB. Al no publicarse parámetros, contexto ni benchmarks en la información disponible, esta ficha se limita a documentar lo declarado por el autor y a marcar explícitamente los datos ausentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer transducer TDT (Token-and-Duration Transducer), exportado desde NeMo 2.2.1 |
| Parámetros totales | no disponible (el modelo base se denomina `parakeet-tdt-0.6b-v3`, lo que sugiere ~0,6 B, no confirmado en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp32 únicamente (el autor indica explícitamente que no hay cuantización) |
| Idiomas soportados | alemán (`de`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (encoder con pesos externos en `encoder.weights`, más `decoder.onnx` y `joiner.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es un transducer TDT, la variante de NeMo/Parakeet en la que el predictor conjunto estima tanto el token como su duración, lo que reduce el número de pasos de decodificación frente a un transducer convencional. El artefacto distribuido aquí contiene las tres piezas habituales: red encoder, red de predicción (decoder) y red conjunta (joiner), todas en ONNX. El encoder almacena sus pesos como datos externos de ONNX, por lo que `encoder.weights` debe permanecer en la misma carpeta que `encoder.onnx`.

No se aporta información sobre el volumen de datos de entrenamiento, la composición del corpus alemán, ni sobre si hubo ajuste por RLHF o DPO; el autor solo declara que el checkpoint `.nemo` original se exportó con NeMo 2.2.1 mediante `encoder/decoder/joint.export` y que se añadieron metadatos de sherpa-onnx al encoder. Un detalle técnico relevante: el campo `url` de los metadatos contiene deliberadamente el nombre del modelo base (`parakeet-tdt-0.6b-v3`) porque sherpa-onnx solo activa la decodificación TDT cuando esa URL contiene la cadena "tdt". No hay reentrenamiento ni cuantización en este repositorio.

## Capacidades

- Reconocimiento automático de voz (ASR) offline en alemán sobre audio, con salida de transcripción.
- Decodificación TDT habilitada mediante los metadatos del encoder.
- Decodificación `greedy_search` y `modified_beam_search`.
- Soporte de hotwords mediante `HotwordsFile` y `bpe.vocab` con `modeling_unit=bpe`, útil para sesgar el reconocimiento hacia vocabulario específico del dominio.
- Ejecución en CPU sin GPU, gracias al formato ONNX y a la integración con sherpa-onnx.
- Integración desde C# (ejemplo incluido en la model card) y, por extensión, desde los demás bindings de sherpa-onnx.
- No se declaran capacidades de traducción, diarización, puntuación, timestamps ni multilingüismo.

## Casos de uso

- Dictado médico local: el propio autor indica que el modelo se usa en la herramienta Med-ASR para reconocimiento de voz en local y solo con CPU, lo que encaja con entornos clínicos donde no se permite enviar audio a la nube.
- Transcripción de notas de voz en escritorio: al ejecutarse vía sherpa-onnx en CPU, puede integrarse en aplicaciones de escritorio (incluido C#) para convertir grabaciones en texto sin dependencias de servidores externos.
- Sesgado de vocabulario con hotwords: en dominios con terminología propia (fármacos, procedimientos, nombres propios) se puede usar `modified_beam_search` con `HotwordsFile` y `bpe.vocab` para aumentar la probabilidad de los términos relevantes.
- Subtitulado y actas de reuniones en alemán: la inferencia offline permite procesar lotes de audio por la noche en servidores sin GPU, reduciendo coste frente a soluciones basadas en GPU.
- Preprocesado de corpus de voz: transcripción masiva de grabaciones en alemán para construir datasets de texto alineado con audio.
- Asistentes de voz embebidos: al no requerir GPU y usar ONNX, es candidato para dispositivos de borde o entornos con recursos limitados, siempre que se valide el rendimiento real en el hardware objetivo.
- Evaluación y prototipado de pipelines ASR: sirve como referencia para comparar un modelo alemán ajustado frente al modelo base de NVIDIA dentro de sherpa-onnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye WER, CER, latencia ni throughput, ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM: no aplica en el escenario previsto; el modelo está pensado para inferencia en CPU. El repositorio ocupa 2,5 GB en fp32.
- GPU recomendadas: no disponibles; el autor no documenta ejecución en GPU para este paquete.
- ¿Cabe en GPU de consumo? No hay datos publicados; al ser una exportación ONNX fp32 de un modelo de la familia 0.6B, en principio podría ejecutarse en GPUs de consumo con memoria suficiente, pero no está verificado en la información proporcionada.
- Opciones de despliegue: sherpa-onnx (C#, y por extensión sus demás bindings), con `model_type = nemo_transducer` y `decoding_method` `greedy_search` o `modified_beam_search`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| zyware/parakeet-primeline-de-sherpa-onnx | TDT transducer (ONNX fp32) | de | ONNX + sherpa-onnx | CC BY 4.0 | Exportación sin reentrenamiento ni cuantización |
| primeline/parakeet-primeline | TDT transducer (NeMo) | de | `.nemo` | CC BY 4.0 | Modelo original del que deriva este paquete |
| nvidia/parakeet-tdt-0.6b-v3 | TDT transducer (NeMo) | no disponible en la información proporcionada | `.nemo` | CC BY 4.0 | Modelo base de NVIDIA sobre el que se hizo el ajuste alemán |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa entre estas variantes.

## Limitaciones y advertencias

- Solo soporta alemán (`de`); no se declaran otros idiomas.
- Es una conversión de formato: no incorpora mejoras de precisión respecto al modelo original y no se han publicado métricas que lo validen.
- El campo `url` de los metadatos está modificado a propósito para forzar la decodificación TDT en sherpa-onnx; alterarlo puede desactivar ese modo de decodificación.
- `encoder.weights` es datos externos de ONNX y debe mantenerse junto a `encoder.onnx`; moverlo o renombrarlo rompe la carga del modelo.
- El uso de hotwords requiere `modified_beam_search` junto con `HotwordsFile` y `bpe.vocab` (`modeling_unit=bpe`); con `greedy_search` no aplican.
- No hay información sobre sesgos, tasas de alucinación, robustez ante ruido o acentos, ni sobre el dominio exacto del corpus de ajuste.
- Licencia CC BY 4.0: permite uso comercial con atribución; es obligatorio citar el modelo original (`primeline/parakeet-primeline`) y el modelo base de NVIDIA (`nvidia/parakeet-tdt-0.6b-v3`).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria publicada.
- No se documentan requisitos de memoria en ejecución ni límites de duración de audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zyware/parakeet-primeline-de-sherpa-onnx
- Modelo original: https://huggingface.co/primeline/parakeet-primeline
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
