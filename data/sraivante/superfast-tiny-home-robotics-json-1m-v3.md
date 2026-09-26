# sraivante/superfast-tiny-home-robotics-json-1m-v3

## Resumen

El modelo `superfast-tiny-home-robotics-json-1m-v3` es un transformer decoder causal de tipo GPT entrenado desde cero por el autor independiente sraivante. Su función es convertir una frase en inglés o hinglish ("bhai bedroom ka pankha high pe chala do") en un único comando JSON de dispositivo domótico, incluyendo reglas condicionales con cláusula `when` para métricas como temperatura, humedad del suelo, calidad del aire o franjas horarias. No es un asistente generalista: es un componente de parsing que se sitúa entre el reconocimiento de voz y el actuador físico.

La relevancia del modelo está en su tamaño extremo y su runtime: 1.143.328 parámetros, pesos de 2,1 MB en fp16, vocabulario a nivel de carácter de 78 símbolos y 360 tokens de contexto. La inferencia depende únicamente de NumPy (más Flask para el servidor opcional), sin PyTorch, sin librería de tokenizador, sin GPU y sin conexión a internet, lo que lo hace apto para Raspberry Pi, Jetson u otros dispositivos de borde que también ejecutan detección de palabra de activación.

Es la versión v3 de una serie; frente a la v1 amplía la cobertura a 1.004 dispositivos, 12 acciones y 7 métricas de sensor para las reglas, y añade un motor NumPy, una interfaz web y una imagen Docker. El modelo se distribuye con licencia Apache-2.0 y está etiquetado por el autor como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal estilo GPT, entrenado desde cero |
| Parametros totales | 1.143.328 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 360 tokens |
| Tipos de cuantizacion | fp16 (pesos publicados en npz); no se documentan otros formatos |
| Idiomas soportados | en (ingles), hi (hindi); el autor indica soporte de hinglish |
| Licencia | Apache-2.0 |
| Formato de pesos | npz (NumPy); fichero `model/model_v3_fp16.npz`, 2.146.783 bytes |

Detalles adicionales de arquitectura: dimensión del modelo d=160, 4 capas, 4 cabezas de atención, FFN de 512 y vocabulario a nivel de carácter de 78 símbolos.

## Arquitectura y entrenamiento

Se trata de un decoder causal estilo GPT con tokenización a nivel de carácter (78 símbolos), dimensión d=160, 4 capas, 4 cabezas de atención y una FFN de 512 unidades, con una ventana de contexto de 360 tokens. El entrenamiento se realizó desde cero sobre el dataset sintético y basado en plantillas `sraivante/home-commands-json-v3`, que cubre 1.004 dispositivos, 12 acciones y 7 métricas de sensor para las reglas condicionales. La salida se restringe a un único objeto JSON de comando de dispositivo.

No se documenta en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni el uso de técnicas de alineación como RLHF o DPO. Tampoco se describe ninguna innovación de decodificación (decodificación especulativa, atención lineal, SSM) más allá del propio diseño minúsculo y del motor de inferencia en NumPy. El modelo devuelve, junto al texto generado, una puntuación de confianza definida como el log-prob medio por carácter generado (cercano a 0,0 indica dominio conocido).

## Capacidades

- Conversión de texto a JSON de comando de dispositivo domótico a partir de frases en inglés o hinglish.
- Generación de reglas condicionales mediante la cláusula `when`, con métricas como `temperature`, `soil_moisture`, `time` o `aqi`, operadores de comparación (`>`, `<`, `==`) y un valor asociado.
- Cobertura de 1.004 dispositivos y 12 acciones según el catálogo `model/devices-catalog.json`.
- Decodificación greedy determinista, con salida de una única línea JSON.
- Puntuación de confianza por comando (log-prob medio por carácter) para discriminar entradas fuera de dominio.
- Inferencia en CPU con NumPy como única dependencia obligatoria; Flask solo para el servidor opcional.
- Soporte bilingüe inglés e hindi, orientado explícitamente a entradas mezcladas (hinglish).
- Integración con MQTT, Home Assistant y validación contra catálogo en los ejemplos incluidos.

No se documenta soporte de tool calling, function calling genérico, razonamiento multi-paso, visión, audio, ni modos de pensamiento (thinking mode) en la información disponible.

## Casos de uso

- Parsing de comandos de voz para domótica: el modelo recibe la transcripción (por ejemplo, de Whisper o Vosk en hindi e inglés) y devuelve el JSON de comando en aproximadamente 70-90 ms para entradas simples, listo para validación contra catálogo antes de actuar.
- Automatización condicional por sensores: frases como "when soil moisture drops below 20 start the garden sprinkler" se traducen en un comando con cláusula `when`, que el motor de reglas almacena y evalúa, disparando el actuador una sola vez por cruce de umbral.
- Puente MQTT para dispositivos de bajo coste: el ejemplo `mqtt_bridge.py` publica en `home/<subject>/set`, lo que permite controlar dispositivos ESP32, Tasmota o Zigbee2MQTT sin depender de servicios en la nube.
- Integración con Home Assistant: el ejemplo `home_assistant.py` mapea los `subject` del catálogo a entidades y llama a servicios en local, manteniendo la lógica de seguridad y permisos en código determinista.
- Despliegue en dispositivos de borde: con 2,1 MB de pesos y 73 MB de RSS en proceso (incluyendo Python y NumPy), encaja en placas como Raspberry Pi o Jetson que además ejecutan wake-word detection, sin GPU ni conexión a internet.
- API REST en contenedor sin GPU: la imagen Docker expone `/api/parse` y devuelve comando, `valid_json`, avisos de catálogo, `confidence`, `latency_ms` y un flag `ok`, lo que permite integrarlo en un backend domótico existente.
- Control por voz multilingüe en el hogar: usuarios que mezclan inglés e hindi pueden emitir órdenes coloquiales ("roz shaam 7 baje garden ki batti chala do") y obtener un comando estructurado con la cláusula horaria correspondiente.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados por un tercero), sobre 1.500 filas reservadas del dataset `home-commands-json-v3` y decodificación greedy:

| Metrica | Dataset / subconjunto | Valor |
|---|---|---|
| Exact match (todas) | home-commands-json-v3, 1.500 filas held-out, greedy | 96,73 % |
| Exact match (comandos simples) | n=900 | 96,89 % |
| Exact match (reglas condicionales) | n=600 | 96,50 % |

Latencia medida por el autor en una sola petición, con Python 3.13, NumPy 2.3 y un Intel Core i7-1360P (hilos por defecto):

| Entrada | Latencia |
|---|---|
| Comando simple (unos 30 caracteres) | 70-90 ms |
| Regla condicional (unos 70 caracteres) | 130-150 ms |
| RSS del proceso con motor cargado y caliente (incluye Python y NumPy) | 73 MB |

El autor indica que la latencia está dominada por la sobrecarga de Python por carácter generado, no por FLOPs, y que las cifras para Raspberry Pi 5 y Jetson Orin Nano todavía no se han medido. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para ejecutarse en CPU y no requiere GPU.
- Pesos en disco: 2.146.783 bytes (aproximadamente 2,1 MB) en fp16.
- Memoria en ejecución: entorno a 73 MB de RSS con el motor cargado y caliente, incluyendo Python y NumPy.
- GPU recomendadas: no se documenta ninguna; no son necesarias.
- Compatibilidad con GPU de consumo: irrelevante, ya que la inferencia es exclusivamente en CPU con NumPy.
- Hardware de borde: el autor menciona Raspberry Pi y Jetson, aunque las cifras de latencia para Raspberry Pi 5 y Jetson Orin Nano no están medidas todavía.
- Opciones de despliegue: script `python engine.py`, uso como módulo Python (`engine.init`, `engine.parse_scored`), servidor web y API REST vía Docker Compose (Flask), e integraciones de ejemplo con MQTT y Home Assistant. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 70-90 ms por comando simple y 130-150 ms por regla condicional en el i7-1360P citado; no se aporta throughput agregado.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables de terceros en la información disponible. La única comparación documentada por el autor es interna, con la versión anterior de la propia serie:

| Modelo | Cobertura | Formato de pesos | Runtime | Licencia |
|---|---|---|---|---|
| superfast-tiny-home-robotics-json-1m-v3 | 1.004 dispositivos, 12 acciones, 7 métricas de sensor | npz fp16 (2,1 MB) | NumPy (y Flask para servidor) | Apache-2.0 |
| superfast-tiny-home-robotics-json-1m-v1 | 30 comandos, 10 tipos de dispositivo | no disponible | Runtime de transformers | no disponible |

Para alternativas de la misma categoría (parsers de comandos domóticos o modelos minúsculos de text-to-JSON) no se dispone de parámetros, contexto, rendimiento ni licencia en la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado explícitamente como experimental por el autor; no se recomienda asumir robustez en producción sin validación propia.
- Es un parser de dominio cerrado: el catálogo `model/devices-catalog.json` define lo que es válido, y toda salida debe validarse contra él antes de actuar. El propio autor indica que solo debe actuarse cuando el flag `ok` sea `true`.
- Riesgo de alucinación en entradas fuera de dominio o con dispositivos no incluidos en el catálogo; la puntuación de confianza (log-prob medio por carácter) sirve como señal, pero no garantiza corrección.
- Arquitectura y vocabulario a nivel de carácter con solo 360 tokens de contexto: no admite diálogos largos ni instrucciones extensas.
- Idiomas limitados a inglés e hindi (con hinglish); no se documenta soporte de castellano ni de otras lenguas.
- Dataset de entrenamiento sintético y basado en plantillas, lo que puede provocar un sesgo hacia las formulaciones vistas durante el entrenamiento y un peor desempeño ante paráfrasis inesperadas.
- Los resultados de benchmarks (96,73 % de exact match) están declarados por el autor y no verificados (`verified: false`); deben tratarse como orientativos.
- Las latencias publicadas corresponden a un Intel Core i7-1360P de sobremesa, no a hardware de borde; el rendimiento en Raspberry Pi 5 o Jetson Orin Nano no está medido.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar las condiciones del catálogo y del dataset asociado antes de un despliegue real.
- No se documenta ninguna capa de seguridad, control de permisos ni gestión de estado de dispositivos; esas responsabilidades recaen enteramente en el código que envuelve al modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sraivante/superfast-tiny-home-robotics-json-1m-v3
- Version v1 de la serie: https://huggingface.co/sraivante/superfast-tiny-home-robotics-json-1m-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/sraivante/home-commands-json-v3
