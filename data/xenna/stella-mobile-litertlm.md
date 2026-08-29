# Xenna/stella-mobile-litertlm

## Resumen

Stella Mobile es un modelo ligero de aproximadamente 270 millones de parametros desarrollado por Xenna, disenado especificamente para control de dispositivos moviles y uso estructurado de herramientas (function calling) en entornos on-device. Forma parte de la familia StelNet y esta especializado en acciones moviles y tareas del juego Tiny Garden, lo que lo convierte en un modelo de proposito especifico mas que en un LLM generalista.

El modelo se distribuye en formato `.litertlm`, el formato de orquestacion de Google AI Edge para ejecucion de modelos de lenguaje en dispositivos, lo que indica que esta optimizado para el runtime LiteRT (antes TensorFlow Lite) y para inferencia en CPU de dispositivos Android. Su tamano reducido (0,3 GB de repositorio) lo hace viable para despliegue local en telefonos sin necesidad de aceleracion por GPU o NPU.

La relevancia de este modelo radica en la tendencia creciente hacia la IA generativa en el borde (edge AI), donde Google ya utiliza LiteRT-LM en productos como Chrome, Chromebook Plus y Pixel Watch. Stella Mobile ejemplifica un caso de uso nicho: automatizacion de acciones en juegos y control de interfaz movil mediante llamadas a funciones, todo ello sin conexion a servidores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StelNet (detalles no disponibles) |
| Parametros totales | ~270M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | .litertlm |

## Arquitectura y entrenamiento

La informacion disponible sobre la arquitectura interna es escasa. El modelo pertenece a la familia StelNet, pero no se especifica si se trata de un transformer denso, un modelo con atencion lineal u otra variante. Se describe como "function-tuned", lo que sugiere un proceso de ajuste fino orientado a la generacion estructurada de llamadas a funciones, probablemente sobre una base preentrenada de proposito general.

No se han publicado datos sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas como RLHF o DPO. El formato `.litertlm` indica que el modelo ha sido convertido y optimizado para el runtime LiteRT-LM de Google, que incluye cuantizacion y compilacion especifica para hardware movil. El objetivo declarado es la ejecucion en CPU de dispositivos Android, lo que implica una optimizacion agresiva para reducir latencia y consumo energetico.

## Capacidades

- Control de acciones moviles: el modelo esta especializado en interpretar y ejecutar acciones sobre la interfaz de dispositivos Android.
- Function calling: soporta llamadas a funciones estructuradas, lo que permite integrarlo en pipelines de automatizacion.
- Gameplay de Tiny Garden: capacidad especifica para jugar o asistir en el juego Tiny Garden, probablemente mediante la generacion de secuencias de acciones.
- Ejecucion on-device: funciona completamente offline en dispositivos Android sin necesidad de conexion a servidores.
- Optimizacion para CPU: no requiere GPU ni NPU, lo que amplia la compatibilidad con hardware movil de gama baja.
- Integracion con LiteRT-LM: compatible con el ecosistema de Google AI Edge, incluyendo la app Google AI Edge Gallery.

## Casos de uso

- Automatizacion de tareas en juegos moviles: el modelo puede generar secuencias de acciones para progresar en Tiny Garden u otros juegos similares, actuando como un agente autonomo que interactua con la interfaz del juego.
- Asistentes de control por voz en Android: combinado con un modulo de reconocimiento de voz, puede traducir comandos hablados en llamadas a funciones del sistema operativo, como abrir aplicaciones o enviar mensajes.
- Pruebas automatizadas de aplicaciones moviles: en entornos de QA, el modelo puede generar interacciones de usuario simuladas (toques, deslizamientos, entradas de texto) para verificar el comportamiento de una app en dispositivos reales.
- Accesibilidad para personas con movilidad reducida: el modelo puede interpretar intenciones de alto nivel y traducirlas en acciones concretas sobre la interfaz, facilitando el uso del telefono mediante comandos simplificados.
- Automatizacion de flujos de trabajo en el dispositivo: por ejemplo, configurar alarmas, gestionar notificaciones o realizar acciones repetitivas en apps de productividad, todo mediante function calling local.
- Demostraciones educativas de IA en el borde: como ejemplo de despliegue de un modelo de lenguaje en hardware movil sin conexion, util para cursos y talleres sobre edge AI y LiteRT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni metricas de latencia o throughput para este modelo.

## Requisitos de hardware

- VRAM estimada: no aplica, el modelo esta disenado para CPU, no para GPU.
- GPU recomendadas: ninguna, el objetivo es CPU de dispositivos Android.
- Compatibilidad con hardware de consumo: si, cualquier telefono Android con soporte para LiteRT-LM puede ejecutarlo; el tamano del repositorio (0,3 GB) sugiere que cabe en dispositivos con almacenamiento limitado.
- Opciones de despliegue: LiteRT-LM runtime, app StelNet ML, Google AI Edge Gallery, o cualquier runtime compatible con el formato `.litertlm`.
- Latencia y throughput: no disponibles. Dado el tamano de 270M de parametros y la optimizacion para CPU, se espera una latencia de decenas a cientos de milisegundos por token, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso principal |
|---|---|---|---|---|---|
| Stella Mobile (Xenna) | ~270M | no disponible | .litertlm | other | Control movil, function calling |
| gemma-4-E2B-it-litert-lm (litert-community) | no disponible | no disponible | .litertlm | no disponible | Instrucciones generales en dispositivo |
| Modelos LiteRT-LM de Google AI Edge | variable | variable | .litertlm | variable | GenAI on-device generalista |

La comparativa es limitada porque no se dispone de especificaciones detalladas de los modelos alternativos en formato LiteRT-LM. La diferencia principal es que Stella Mobile es un modelo de nicho orientado a tareas especificas (control movil y juegos), mientras que las alternativas de la comunidad LiteRT suelen ser modelos generalistas de instrucciones.

## Limitaciones y advertencias

- Licencia "other" sin especificar: el uso comercial puede estar restringido; es necesario contactar con el autor para aclarar los terminos antes de usar el modelo en produccion.
- Informacion tecnica incompleta: no se conocen la arquitectura exacta, el dataset de entrenamiento, la longitud de contexto ni los idiomas soportados, lo que dificulta evaluar su idoneidad para tareas fuera de su dominio objetivo.
- Riesgo de alucinacion en llamadas a funciones: al ser un modelo pequeno (270M), puede generar argumentos o nombres de funciones invalidos, especialmente en escenarios no cubiertos por su entrenamiento.
- Dominio limitado: esta especializado en Tiny Garden y acciones moviles; su rendimiento en tareas generales de lenguaje o razonamiento probablemente sea pobre.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad o rendimiento, lo que impide compararlo objetivamente con alternativas.
- Dependencia del ecosistema LiteRT: el formato `.litertlm` limita su uso a runtimes compatibles con LiteRT-LM, lo que reduce la portabilidad a otros frameworks de inferencia.
- Sin comunidad ni adopcion: cero descargas y cero likes en HuggingFace, lo que sugiere que no ha sido validado por terceros ni probado en entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Xenna/stella-mobile-litertlm
- Repositorio LiteRT-LM (Google AI Edge): https://github.com/google-ai-edge/LiteRT-LM
- Ejemplos y samples de LiteRT: https://github.com/google-ai-edge/litert-samples
- Documentacion de LiteRT-LM: https://developers.google.com/edge/litert-lm/overview
- Guia de despliegue GenAI con LiteRT: https://developers.google.com/edge/litert/genai/overview
- Modelo de referencia de la comunidad LiteRT: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
