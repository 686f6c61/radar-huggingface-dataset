# sulabhkatiyar/indic-translate-mini

## Resumen

indic-translate-mini es un modelo de traducción automática bidireccional entre inglés y once lenguas índicas (hindi, tamil, bengalí, telugu, malayo, guyaratí, punyabí, canarés, maratí, asamés y oriya), lo que cubre 22 direcciones de traducción con un único artefacto. Lo desarrolla sulabhkatiyar y se publica bajo licencia derivada de las fuentes de datos originales (upstream-data-licences). Su propuesta principal es el despliegue en dispositivos de borde: el paquete int8 en ONNX ocupa 60 MB y funciona con numpy, onnxruntime y sentencepiece, sin necesidad de PyTorch.

La arquitectura es un transformer encoder-decoder con d_model 512, 10 capas de encoder y 2 de decoder, feed-forward SwiGLU, posiciones rotatorias, grouped-query attention en el decoder y un vocabulario SentencePiece compartido de 16k. El modelo completo tiene 48,8M de parámetros y se entrenó durante 5,61B tokens sobre unos 213M ejemplos. La dirección de traducción se selecciona mediante una etiqueta de lengua destino y una máscara de salida por idioma, en lugar de mantener modelos separados por sentido.

Es relevante para quien necesite traducción inglés-índico offline, con latencia de decenas de milisegundos en CPU y un consumo de memoria en torno a 145 MB, a costa de una calidad inferior a IndicTrans2 (1,1B parámetros): entre 2,6 y 4,1 puntos chrF++ por debajo desde inglés y entre 5 y 10 hacia inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder; d_model 512, 10 capas encoder, 2 capas decoder, SwiGLU FFN, posiciones rotatorias, GQA en decoder |
| Parametros totales | 48,8M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo a nivel de frase; sin contexto documental) |
| Tipos de cuantizacion | int8 (paquete por defecto, 60 MB) y fp32 (export ONNX, 238 MB) |
| Idiomas soportados | en, hi, ta, bn, te, ml, gu, pa, kn, mr, as, or (22 direcciones en/desde inglés) |
| Licencia | other (upstream-data-licences; cada fuente de datos conserva su licencia) |
| Formato de pesos | ONNX (encoder, decoder_side0, decoder_side1, outproj) + tablas de embeddings .npy + SentencePiece |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder compacto: 10 capas de encoder y solo 2 de decoder, dimensión 512, feed-forward con SwiGLU, codificación posicional rotatoria y grouped-query attention en el decoder. Comparte un vocabulario SentencePiece de 16.000 tokens y aplica una máscara de salida específica por lengua destino, lo que permite cubrir las 22 direcciones con un único conjunto de pesos. El decoder se divide en dos grafos ONNX (side0 para destino inglés, side1 para destinos índicos) y la proyección de salida va en un grafo aparte; la tabla de embeddings int8 se aplica en el host.

El entrenamiento usó 5,61B tokens sobre aproximadamente 213M ejemplos: unos 101M pares de frases deduplicados usados en ambas direcciones, 0,74M pares sintéticos de números, URL y marcadores de posición, y ventanas y documentos multi-frase construidos a partir de ellos. Las fuentes principales son BPCC de AI4Bharat (variantes minadas, filtradas por NLLB y Samanantar) y semillas como ILCI y MASSIVE, cada una con su propia licencia. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Traducción bidireccional inglés ↔ 11 lenguas índicas, 22 direcciones, con salida en el alfabeto nativo del idioma destino.
- Selección de dirección mediante etiqueta de lengua destino, sin modelos separados por sentido.
- Procesamiento a nivel de frase: normaliza la entrada, la divide en frases, traduce frase a frase y las une con un espacio, preservando las líneas.
- Decodificación con búsqueda por haces (beam 5, penalización de longitud 1.0) o greedy con `--beam 1`.
- Opción `--native-digits` para escribir los dígitos en el alfabeto del idioma destino en lugar de ASCII.
- Inferencia por lotes (acepta listas de frases) y uso tanto por API Python como por CLI.
- Ejecución sin PyTorch: solo numpy, onnxruntime y sentencepiece.
- No soporta traducción entre lenguas índicas (solo inglés ↔ índico), tool calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Traducción offline en aplicaciones móviles: el paquete int8 de 60 MB y el pico de memoria de ~145 MB permiten embeber el modelo en una app Android o iOS con onnxruntime, traduciendo frases sin conexión.
- Atención al cliente en kioscos o terminales de bajo coste: traducción de mensajes cortos en CPU x86 sin VNNI con latencias de ~120-128 ms por frase FLORES en modo greedy, suficiente para turnos conversacionales simples.
- Preprocesado de corpus multilingües: traducción por lotes de frases inglés-índico en pipelines de datos con `Translator.translate` aceptando listas, útil para normalizar o aumentar datasets.
- Señalización y cartelería dinámica: traducción de avisos cortos (transporte, sanidad, administración) a la lengua del usuario con salida en alfabeto nativo y dígitos nativos opcionales.
- Asistencia a la lectura en navegador o extensiones: traducción frase a frase de párrafos web en el propio dispositivo, sin enviar texto a servidores externos.
- Baseline de investigación en MT de bajos recursos: modelo de 48,8M parámetros como referencia reproducible para comparar técnicas de destilación, cuantización o adaptación a nuevas lenguas índicas.
- Traducción de consultas y formularios en entornos con conectividad intermitente: integración en CLI (`run_cli.sh`) para procesar ficheros de una frase por línea en servidores sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, FLORES por métrica absoluta) en la información disponible. La model card sí reporta comparaciones relativas de calidad y medidas de latencia:

| Metrica | Valor reportado |
|---|---|
| Diferencia chrF++ vs IndicTrans2 (1,1B), desde inglés | 2,6 a 4,1 puntos por debajo |
| Diferencia chrF++ vs IndicTrans2 (1,1B), hacia inglés | 5 a 10 puntos por debajo |
| Latencia CPU, 1 hilo, batch 1, frase corta, Apple M1 | ~25 ms greedy / ~65-75 ms beam 5 |
| Latencia CPU, frase FLORES, servidor x86 sin VNNI | ~120-128 ms greedy |
| Memoria pico | ~145 MB |

## Requisitos de hardware

- VRAM: no aplica para el paquete int8 (ejecución en CPU); el pico de memoria reportado es de ~145 MB. Para el paquete fp32 en GPU, la estimación no está disponible en la información proporcionada.
- GPU recomendadas: no disponible; el diseño objetivo es CPU y dispositivos de borde.
- GPU de consumo: el modelo está pensado para ejecutarse sin GPU; cabe en cualquier CPU moderna y en teléfonos.
- Despliegue: onnxruntime (CPU), con numpy y sentencepiece; se incluye el paquete `itm.infer` y los ejemplos `translate.py` y `run_cli.sh`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~25 ms greedy y ~65-75 ms beam 5 por frase corta en Apple M1 con 1 hilo; ~120-128 ms por frase FLORES en CPU x86 sin VNNI en modo greedy. El throughput con más hilos o batch mayor no está disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| indic-translate-mini | 48,8M | no disponible (nivel de frase) | en ↔ 11 índicos (22 direcciones) | other (upstream-data-licences) | ONNX int8/fp32 |
| IndicTrans2 | 1,1B | no disponible en la información | en ↔ índicos (modelos separados por sentido) | no disponible en la información | no disponible en la información |
| NLLB (variantes pequeñas) | no disponible en la información | no disponible | multilingüe amplio | no disponible en la información | no disponible en la información |

Frente a IndicTrans2, indic-translate-mini ofrece un único modelo para las 22 direcciones y un tamaño 22 veces menor, con una penalización de 2,6-4,1 chrF++ desde inglés y 5-10 hacia inglés. No se dispone de datos de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Calidad inferior a IndicTrans2 de forma medible; no es adecuado para uso legal, médico o de alto riesgo sin revisión humana.
- Modelo a nivel de frase: no tiene contexto documental y las traducciones pueden ser incorrectas, incompletas o infieles.
- Entrenado con texto web minado a gran escala, por lo que puede reproducir sesgos y contenido inseguro presente en los datos.
- Solo cubre inglés ↔ índico; no traduce entre lenguas índicas.
- La licencia es "other" con nombre upstream-data-licences: cada fuente (BPCC, Samanantar, IITB English-Hindi CC-BY-NC-4.0, PMIndia CC-BY-4.0, WikiMatrix CC-BY-SA, NLLB ODC-BY, entre otras) conserva sus términos, y el usuario debe verificar el cumplimiento para uso comercial.
- El paquete int8 y el fp32 produjeron salidas idénticas en los seis ejemplos de la model card, pero no se documenta una evaluación sistemática de la degradación por cuantización.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria publicada.
- La fecha de creación indicada (2026-11-22) resulta anómala y conviene verificarla antes de citar el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/sulabhkatiyar/indic-translate-mini
- Dataset BPCC (AI4Bharat): https://huggingface.co/datasets/ai4bharat/BPCC
- Dataset indic-tts-multilingual-prepared (mismo autor, contexto): https://huggingface.co/datasets/sulabhkatiyar/indic-tts-multilingual-prepared
- Paper o blog de IndicTrans2: no disponible en la información proporcionada
- Repositorio de código independiente: no disponible (el código de inferencia se incluye en `code/` dentro del propio repositorio)
- Demo: no disponible
