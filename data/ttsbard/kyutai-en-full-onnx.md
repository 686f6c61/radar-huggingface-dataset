# TTSBard/kyutai-en-full-onnx

## Resumen

`TTSBard/kyutai-en-full-onnx` es un paquete de grafos ONNX Runtime y configuracion local para ejecutar en CPU el modelo de sintesis de voz Pocket TTS en ingles de Kyutai, dentro de la aplicacion TTSBard. No es un modelo entrenado desde cero ni una redistribucion completa de pesos: el repositorio contiene unicamente los grafos ONNX ya exportados y cuantizados a INT8 (`flow_lm_main_int8.onnx`, `flow_lm_flow_int8.onnx`, `mimi_decoder_int8.onnx`, `mimi_encoder.onnx`, `text_conditioner.onnx`), un `config.yaml`, un descriptor `pocket.json` y un fichero `SHA256SUMS`. Los pesos originales (`model.safetensors`), el tokenizador y los embeddings de voz se descargan directamente desde la revision fijada de `kyutai/pocket-tts-without-voice-cloning`.

El modelo base es la variante inglesa de Pocket TTS sin clonacion de voz de Kyutai, un sistema de texto a voz basado en un modelo de lenguaje de flujo (flow matching) combinado con un codec neuronal Mimi para la decodificacion de audio. La propuesta de este repositorio es practica: permitir inferencia local en CPU sin depender de GPU, con un peso total de repositorio de unos 0,2 GB y licencia CC-BY-4.0.

Es relevante para desarrolladores que quieran integrar TTS en aplicaciones de escritorio o pipelines ligeros sin infraestructura GPU, y que prefieran un formato ONNX portable frente a dependencias de PyTorch. La contrapartida es que el repositorio por si solo no es autosuficiente: requiere descargar los artefactos upstream y esta disenado especificamente para TTSBard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en flow matching (flow LM) con codec neuronal Mimi; exportado a grafos ONNX Runtime |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (grafos `*_int8.onnx`); el encoder Mimi se distribuye sin cuantizar (`mimi_encoder.onnx`) |
| Idiomas soportados | ingles (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (grafos de inferencia); pesos upstream en safetensors descargados aparte |

## Arquitectura y entrenamiento

El modelo base, Pocket TTS de Kyutai, sigue un esquema de sintesis neuronal en dos etapas: un modelo de lenguaje de flujo que genera representaciones latentes de audio a partir de texto condicionado, y un decodificador Mimi que convierte esas representaciones en forma de onda. Este repositorio no incluye informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden a la model card upstream de Kyutai, no a este paquete.

La innovacion tecnica de este repositorio es la exportacion a ONNX Runtime con cuantizacion INT8 de los componentes principales (flow LM y decodificador Mimi), lo que reduce el coste computacional y permite ejecucion en CPU. El paquete incluye tambien un `config.yaml` que resuelve localmente `model.safetensors` y `tokenizer.json`, y un descriptor `pocket.json` que define el estado de la voz integrada `alba`. No se documenta en la informacion disponible ninguna tecnica adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles a partir de texto de entrada.
- Generacion de audio mediante decodificador Mimi integrado en el pipeline ONNX.
- Uso de una voz integrada predefinida (`alba`) a traves del descriptor `pocket.json`.
- Ejecucion en CPU mediante ONNX Runtime, sin requerir GPU.
- Integracion con la aplicacion TTSBard como paquete de modelo local.
- No incluye clonacion de voz (la variante base es explicitamente "without voice cloning").
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso; es un modelo exclusivamente de TTS.
- Soporte multilingue: no; solo ingles.

## Casos de uso

- Lectura de articulos y documentos en aplicaciones de escritorio: el modelo puede convertir texto en audio en local sobre CPU, lo que permite integrar narracion en lectores o herramientas de accesibilidad sin conexion a servicios en la nube.
- Asistentes por voz sin GPU: al ejecutarse con ONNX Runtime en CPU, es adecuado para dispositivos o entornos donde no hay acelerador grafico disponible y se necesita sintesis de voz en tiempo de ejecucion.
- Generacion de audiolibros o podcasts automatizados en ingles: el pipeline texto-a-audio permite procesar lotes de texto y producir ficheros de audio con una voz consistente (`alba`).
- Pruebas de integracion y desarrollo de aplicaciones TTS: el paquete ONNX y el descriptor `pocket.json` facilitan incorporar el modelo en TTSBard y validar el flujo completo con los artefactos upstream fijados por revision.
- Prototipado de interfaces conversacionales: para demos de asistentes en ingles donde se prioriza bajo coste de infraestructura sobre calidad maxima de sintesis.
- Pipelines de preprocesado de datos: generacion de locuciones de prueba o datasets de audio sintetico en ingles para experimentacion, con la ventaja de que todo el proceso ocurre en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso objetivo (CPU); no se dispone de estimacion de VRAM para ejecucion en GPU.
- GPU recomendadas: no disponible; el paquete esta pensado para CPU con ONNX Runtime.
- Compatibilidad con GPU de consumo: no se documenta; el diseno apunta a ejecucion en CPU.
- Opciones de despliegue: ONNX Runtime (libreria declarada) dentro de TTSBard; requiere descargar los pesos upstream (`model.safetensors`, `tokenizer.json`, `embeddings/alba.safetensors`) desde la revision fijada de `kyutai/pocket-tts-without-voice-cloning`.
- Latencia y throughput: no disponible.
- Tamano del repositorio: 0,2 GB (solo grafos ONNX, configuracion y descriptor).

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TTSBard/kyutai-en-full-onnx | TTS (flow matching + Mimi) | Ingles | CC-BY-4.0 | ONNX (INT8) | Paquete para TTSBard; requiere pesos upstream |
| kyutai/pocket-tts-without-voice-cloning | TTS (modelo base) | Ingles | CC-BY-4.0 | safetensors | Modelo original de Kyutai; sin clonacion de voz |
| Alternativas de TTS open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El repositorio no es autosuficiente: no incluye pesos (`model.safetensors`), tokenizador ni embeddings de voz; hay que descargarlos de la revision fijada del modelo base de Kyutai.
- Solo soporta ingles; no es adecuado para sintesis en castellano u otros idiomas.
- No incluye clonacion de voz; la unica voz documentada es la integrada `alba`.
- Disenado especificamente para TTSBard; su uso fuera de esa aplicacion requiere adaptar el `config.yaml` y el descriptor `pocket.json`.
- La cuantizacion INT8 puede introducir perdida de calidad en el audio respecto al modelo en precision completa; no se documenta una evaluacion comparativa.
- Riesgo de alucinacion o errores de pronunciacion inherente a los sistemas TTS neuronales; no se documentan sesgos especificos.
- Licencia CC-BY-4.0: permite uso comercial con atribucion a Kyutai y a TTSBard; es obligatorio conservar la atribucion indicada en la model card.
- Sin datos de benchmarks, latencia ni throughput publicados; la evaluacion de rendimiento debe hacerse por cuenta propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TTSBard/kyutai-en-full-onnx
- Modelo base (Kyutai Pocket TTS sin clonacion de voz): https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- Revision fijada del modelo base: https://huggingface.co/kyutai/pocket-tts-without-voice-cloning/tree/a7056f505a4a8ca72d8b5fb1440071d6f1a35739
- Ficheros de idioma ingles del modelo base: https://huggingface.co/kyutai/pocket-tts-without-voice-cloning/tree/a7056f505a4a8ca72d8b5fb1440071d6f1a35739/languages/english
- Repositorio de TTSBard: https://github.com/ttsbard/TTSBard
