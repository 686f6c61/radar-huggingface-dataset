# Vantuk/model_set_v68

## Resumen

Vantuk/model_set_v68 es un repositorio que agrupa un conjunto de activos de voz para el modulo RB3 Gen 2 Linux: reconocimiento automatico del habla (ASR) en vietnamita, ingles y coreano, deteccion de idioma hablado (LID), evaluacion de "readiness" de la fuente, deteccion de actividad de voz (VAD), traduccion automatica y sintesis de voz basada en Piper. No se trata de un unico modelo generativo de proposito general, sino de una coleccion de artefactos ONNX y binarios QNN pensados para ejecutarse sobre onnxruntime-qnn 2.4.0 con QNN 2.48.40 en hardware Qualcomm.

El repositorio contiene pesos en formato ONNX (con wrappers v68) y un GGUF Q4_0 para el componente de traduccion Hy-MT2, ademas de binarios QNN que deben mantenerse junto a su wrapper correspondiente. El tamano total del repositorio es de 1,8 GB y el recuento real de parametros en safetensors asciende a 1.601.173.504, aunque esta cifra agrega componentes heterogeneos y no corresponde a un unico transformer.

Su relevancia es de nicho: sirve como referencia de despliegue de una cadena completa de voz (ASR, LID, VAD, traduccion y TTS) en un dispositivo embebido Qualcomm con aceleracion QNN, con metricas de rendimiento medidas en placa. No hay publicados resultados de benchmarks academicos ni una model card con especificaciones formales de arquitectura, licencia o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto heterogeneo: GIPFormer (ASR VI), SenseVoice (ASR EN/KO), Sherpa streaming (ASR KO), ECAPA (LID), LNU8 transformer W8A16 (readiness), Hy-MT2 (traduccion), Piper (TTS) |
| Parametros totales | 1.601.173.504 (agregado en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 (backbone LID y transformer readiness), Q4_0 (GGUF de Hy-MT2), FP32 (cabezal LID en CPU) |
| Idiomas soportados | Vietnamita, ingles, coreano (ASR, LID y traduccion); no disponible el resto |
| Licencia | no disponible (la model card indica que aplican las licencias individuales de cada modelo y dato upstream) |
| Formato de pesos | ONNX, GGUF (930.902.816 bytes para Hy-MT2), binarios QNN |

## Arquitectura y entrenamiento

El repositorio no documenta un entrenamiento propio: es un ensamblaje de modelos upstream empaquetados para su ejecucion en el borde. La cadena combina un backbone ECAPA para deteccion de idioma hablado con cuantizacion W8A16 y cabezal FP32 en CPU; reconocedores ASR distintos por idioma (GIPFormer para vietnamita, SenseVoice para ingles y coreano, Sherpa en modo streaming para coreano); un transformer LNU8 W8A16 para evaluar la "readiness" de la fuente a partir de embeddings SentencePiece; un modelo de traduccion Hy-MT2 en GGUF Q4_0 ejecutado con llama.cpp; y un decodificador Piper dividido en ventanas de 128 frames con encoder, duracion y flow en CPU y decodificador W8A16.

La innovacion tecnica destacable es la integracion con el stack onnxruntime-qnn 2.4.0 y QNN 2.48.40, con wrappers v68 que deben mantenerse junto a su binario QNN correspondiente. No se aportan datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO, ya que el autor no entrena estos modelos sino que los empaqueta.

## Capacidades

- Reconocimiento automatico del habla en vietnamita (GIPFormer), ingles y coreano (SenseVoice), y coreano en streaming (Sherpa en CPU).
- Deteccion de idioma hablado (LID) con ECAPA, con clasificacion de entradas VI/EN/KO.
- Evaluacion de "readiness" de la fuente mediante un transformer LNU8 sobre embeddings SentencePiece.
- Deteccion de actividad de voz (VAD) como componente del conjunto.
- Traduccion automatica en seis direcciones mediante Hy-MT2 (GGUF Q4_0 con llama.cpp).
- Sintesis de voz con Piper, con encoder, duracion y flow en CPU y decodificador W8A16 en ventanas de 128 frames.
- Ejecucion en dispositivo Qualcomm RB3 Gen 2 Linux con aceleracion QNN.
- No se documentan capacidades de tool calling, agentes, vision ni audio generativo mas alla de la cadena de voz descrita.

## Casos de uso

- Reconocimiento de voz embebido multilingue: desplegar ASR en vietnamita, ingles y coreano sobre la placa RB3 Gen 2, usando GIPFormer o SenseVoice segun el idioma y Sherpa para streaming coreano en CPU.
- Enrutado por idioma en un asistente de voz: la deteccion LID con ECAPA permite seleccionar el reconocedor adecuado antes de transcribir, lo que evita ejecutar varios ASR en paralelo.
- Filtrado de audio en captura continua: el componente VAD descarta silencio y reduce el coste de inferencia en dispositivos con recursos limitados.
- Traduccion local de conversaciones: Hy-MT2 en GGUF Q4_0 con llama.cpp permite traducir entre seis direcciones en el propio dispositivo, con un rendimiento medido de 103,60 tokens/s en pp64 y 16,15 tokens/s en tg32 sobre cuatro hilos de CPU.
- Sintesis de voz en el borde: Piper con decodificador W8A16 genera audio a 0,071-0,099 segundos por segundo de audio (excluyendo fonemizacion), adecuado para respuestas habladas en un asistente local.
- Validacion de calidad de entrada: el modulo de readiness (0,9991 en una frase vietnamita incompleta) puede usarse como puerta previa a la traduccion o al ASR para descartar entradas no validas.

## Benchmarks y rendimiento

| Componente | Configuracion | Resultado |
|---|---|---|
| ECAPA LID | Backbone W8A16, cabezal FP32 CPU | Clasifico correctamente las ocho grabaciones VI/EN/KO en un log previo; ambas entradas VI nuevas devolvieron clase 102 |
| ASR | GIPFormer VI, SenseVoice EN/KO, Sherpa KO streaming en CPU | Todos los reconocedores produjeron texto; ambos reconocedores coreanos tuvieron dificultades con la grabacion del manometro |
| Readiness | SentencePiece, embedding lookup CPU, transformer LNU8 W8A16 | Coincidio en seis de siete etiquetas; la frase vietnamita incompleta "Xin chao moi nguoi hom nay chung ta" obtuvo 0,9991 como ready |
| Hy-MT2 | GGUF Q4_0 enviko32k, llama.cpp b12069, cuatro hilos CPU | Seis direcciones devolvieron texto adecuado; pp64 103,60 ± 0,02 tokens/s, tg32 16,15 ± 0,01 tokens/s; cada traduccion CLI 11,59-12,83 s incluyendo arranque |
| Piper | Encoder/duracion/flow CPU, decodificador W8A16, ventanas de 128 frames | Audio generado en dos frases por idioma; 0,071-0,099 s por segundo de audio, excluyendo fonemizacion |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Hardware de referencia: placa Qualcomm RB3 Gen 2 con Linux, onnxruntime-qnn 2.4.0 y QNN 2.48.40; las librerias de runtime se suministran por separado.
- VRAM estimada: no disponible; el conjunto esta orientado a aceleradores Qualcomm y CPU, no a GPU dedicada.
- GPU recomendadas: no aplica segun la informacion disponible; no se documenta ejecucion en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: onnxruntime-qnn para los wrappers ONNX v68 y binarios QNN; llama.cpp (build b12069) para el GGUF de Hy-MT2; CPU para los componentes Piper y Sherpa.
- Latencia y throughput: Hy-MT2 a 103,60 tokens/s en pp64 y 16,15 tokens/s en tg32 con cuatro hilos de CPU; Piper a 0,071-0,099 s por segundo de audio; el resto de componentes sin cifras de latencia publicadas.

## Comparativa con modelos similares

No disponible. El repositorio es un conjunto de activos de voz para un dispositivo concreto y no se han publicado datos que permitan compararlo con alternativas de la misma categoria (por ejemplo, otros paquetes ASR/TTS para Qualcomm o para el borde) en parametros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- La licencia no esta especificada y la model card indica que se aplican las licencias individuales de cada modelo y dato upstream; es imprescindible revisarlas antes de cualquier uso comercial.
- El conjunto esta disenado para RB3 Gen 2 Linux con onnxruntime-qnn 2.4.0 y QNN 2.48.40; los wrappers v68 ONNX deben mantenerse junto a su binario QNN correspondiente, lo que limita la portabilidad.
- Los reconocedores coreanos mostraron dificultades con una grabacion concreta (manometro), lo que sugiere degradacion en audio tecnico o con ruido.
- El modulo de readiness clasifico como "ready" (0,9991) una frase vietnamita incompleta, lo que indica riesgo de falsos positivos en la validacion de entrada.
- No hay informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica completa ni limites de contexto.
- El repositorio tiene cero descargas y cero likes, y no cuenta con model card formal de especificaciones; su madurez para produccion no esta contrastada.
- Los datos de rendimiento proceden de pruebas puntuales en placa (una o pocas frases por idioma) y no de una evaluacion sistematica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Vantuk/model_set_v68
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
