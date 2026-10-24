# sparrow-decider/sparrow-pico-rover

# sparrow-pico-rover (v1.1): modelo de decisión compilado a C

## Resumen

sparrow-pico-rover es un modelo de decisión de tipo tabular publicado por el proyecto comunitario Sparrow Decider (autor: Vivek Raja P S). No es un modelo de lenguaje: es el resultado del compilador `sparrow-pico`, que convierte una especificación de reglas y preguntas sobre un dispositivo concreto en una cabecera C autocontenida. En este caso responde tres preguntas fijas de un pequeño rover —`action` (continuar, ralentizar, parar, atracar, replanificar), `need_charge` (sí/no) y `risk` (seguro, riesgo menor, riesgo alto, peligro)— a partir de cinco lecturas de sensores: batería (0-100 %), obstáculo frontal (0-8 m), distancia al objetivo (0-60 m), tipo de camino (libre, bloqueado, concurrido, suelo mojado) y si lleva carga.

Técnicamente son tres perceptrones multicapa independientes (ReLU, 16 unidades ocultas) destilados de un profesor LLM de 2B, con 501 parámetros en total y unos 2 KB de artefacto por pregunta. El modelo compilado se ejecuta sin dependencias en cualquier microcontrolador con compilador C y `<math.h>`: la model card reporta 9,3 µs por decisión en un ESP32-S3 a 240 MHz y 0,18 µs en un portátil.

Su relevancia es doble. Por un lado, demuestra una vía práctica para llevar decisiones aprendidas de un LLM a hardware de menos de 10 dólares con latencia de microsegundos. Por otro, sirve como ejemplo reproducible para medir y compilar el propio modelo antes de escribir lógica equivalente a mano. Conviene subrayar que es un modelo de ejemplo, no general: solo responde esas tres preguntas para ese conjunto exacto de características, y el autor advierte explícitamente de que nunca debe sustituir a un límite de seguridad codificado a mano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres MLP independientes (uno por pregunta), activación ReLU, 16 unidades ocultas, sobre vector de características en crudo; compilados a C con kernel denso seleccionable (`SPARROW_PICO_KERNEL` 0, 1 o 2) |
| Parametros totales | 501 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: entrada tabular de 5 características, sin contexto secuencial ni conversacional |
| Tipos de cuantizacion | no disponible / no aplica: se distribuye como código C con aritmética en coma flotante; no hay pesos en formatos cuantizados tipo GGUF, AWQ o GPTQ |
| Idiomas soportados | no aplica: no procesa texto (la model card no declara idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Cabecera C `sparrow_pico_rover.h` (24 KB de código fuente) y especificación `rover.json`; sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El estudiante es un MLP ReLU diminuto por pregunta (16 unidades ocultas) que recibe el vector de características en crudo y devuelve logits o probabilidades por clase. Se entrena desde cero, por lo que el repositorio no incluye pesos de terceros; el script `training/pico_compile.py` escribe después el modelo como C. La API generada es homogénea para las tres preguntas: `rover_<q>(&s, probs)`, `rover_<q>_argmax(&s)`, `rover_<q>_logits(&s, out)`, más `ROVER_<Q>_N` y `rover_<q>_options[]`.

El profesor es el modelo público Strands Decider 2B (`StrandsAgents/strands-decider-2B-qwen3.5-v1-2610`, Apache-2.0), al que se presentaron 3.000 estados de rover muestreados y renderizados como texto junto con las reglas de la especificación: parar si algo está a menos de 0,4 m, volver al dock con batería por debajo del 15 %, ralentizar en zonas concurridas o con suelo mojado, replanificar si el camino está bloqueado y, en el resto de casos, continuar. No se documentan innovaciones de inferencia (decodificación especulativa, atención lineal) porque no hay atención ni generación: la innovación está en la destilación y en la compilación estática a C sin dependencias.

## Capacidades

- Clasificación tabular de decisión: `action` sobre 5 clases (continue, slow, stop, dock, replan) a partir de 5 características.
- Clasificación binaria `need_charge` (sí/no) derivada de la batería y el contexto.
- Puntuación de riesgo en 4 niveles (safe, minor risk, high risk, danger).
- Salida de probabilidades calibradas por el profesor, no solo la clase argmax, lo que permite umbralizar en el código de control.
- Ejecución bare-metal sin dependencias ni asignación dinámica, apta para firmware de microcontrolador.
- Convivencia en el mismo MCU con un modelo de texto nano (ejemplo `esp32s3_robot` del repositorio).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Navegación reactiva de un rover de bajo coste: el firmware llama a `rover_action_argmax(&s)` en cada ciclo de control (9,3 µs en ESP32-S3) para decidir entre continuar, ralentizar o parar; la parada dura a 0,4 m se mantiene además en código plano como límite de seguridad.
- Gestión autónoma de batería y retorno al dock: con batería al 6 % el modelo libera `dock` con probabilidad 0,81, de modo que la lógica de recarga no necesita reglas manuales ni conectividad.
- Robots de almacén con zonas congestionadas: la característica `path = crowded` o `wet floor` permite reducir velocidad de forma contextual sin escribir una máquina de estados específica por zona.
- Replanificación ante bloqueos: cuando `path = blocked`, el modelo emite `replan` y el planificador de nivel superior decide la nueva ruta; útil en flotas con obstáculos cambiantes.
- Despliegue masivo en hardware sin GPU: al ser una cabecera C de unos 2 KB por pregunta, cabe en microcontroladores de céntimos y se puede replicar en cientos de unidades sin coste de inferencia en la nube.
- Prototipado y validación de especificaciones: compilar el modelo y comparar su salida con las reglas escritas a mano (94,0 % de acuerdo en estados reservados) antes de invertir en lógica de control definitiva.
- Asistente de voz o texto local combinado: el ejemplo `esp32s3_robot` ejecuta esta cabecera junto a un modelo de texto nano en el mismo ESP32-S3, dejando el LLM para la interacción y el modelo pico para las decisiones duras en tiempo real.
- Docencia e investigación en TinyML: caso reproducible de destilación de un profesor de 2B a 501 parámetros y 9,3 µs de latencia, con el código de compilación disponible.

## Benchmarks y rendimiento

| Medida | Valor |
|---|---|
| Acuerdo con las reglas de la especificación (estados reservados) | 94,0 % |
| Profesor Strands Decider 2B en la misma métrica | 94,2 % |
| Latencia por decisión en ESP32-S3 a 240 MHz | 9,3 µs (primer build en chip: 42,9 µs) |
| Latencia por decisión en portátil | 0,18 µs |
| Tamaño | ~2 KB por pregunta; 501 parámetros |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no resultarían aplicables a un modelo tabular de este tipo. El throughput aproximado derivado de la latencia medida es de unas 107.000 decisiones por segundo en ESP32-S3 y de unos 5,5 millones por segundo en portátil, sin contabilizar el coste de lectura de sensores ni del bucle de control.

## Requisitos de hardware

- VRAM: no requiere GPU ni memoria de vídeo; la inferencia es puramente en CPU/MCU.
- Plataforma mínima: cualquier microcontrolador con compilador C y `<math.h>`; medido en ESP32-S3 a 240 MHz.
- Cabe en cualquier GPU de consumo de forma irrelevante (0,18 µs por decisión en portátil); también en placas sin sistema operativo.
- Huella de memoria: no disponible de forma desglosada; la fuente C ocupa 24 KB y el artefacto por pregunta ronda los 2 KB.
- Despliegue: compilación estática con `cc -std=c99 -O2 -o rover_demo main.c -Irover -lm`; sin dependencias. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Selección de kernel: `SPARROW_PICO_KERNEL` (0, 1 o 2) escoge la variante de kernel denso; no se detallan diferencias de rendimiento entre variantes.
- Latencia y throughput: 9,3 µs por decisión en ESP32-S3 y 0,18 µs en portátil, según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Contexto | Licencia | Despliegue |
|---|---|---|---|---|---|
| sparrow-pico-rover v1.1 | 501 | 5 características numéricas y categóricas | no aplica | Apache-2.0 | Microcontrolador con compilador C, sin dependencias |
| Strands Decider 2B (profesor) | 2B (según la model card) | Texto renderizado con el estado y las reglas | no disponible | Apache-2.0 | Runtime de LLM en CPU o GPU |
| Otros modelos de decisión TinyML comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el propio profesor: el modelo pico iguala su acuerdo con las reglas (94,0 % frente a 94,2 %) con seis órdenes de magnitud menos parámetros y sin runtime de inferencia, a cambio de perder generalidad, entrada en lenguaje natural y capacidad de añadir preguntas sin recompilar.

## Limitaciones y advertencias

- Modelo de ejemplo, no general: solo responde `action`, `need_charge` y `risk` para ese conjunto exacto de características; otro robot requiere su propia especificación y compilación.
- Hereda los errores del profesor: el 6,0 % de desacuerdo con las reglas en estados reservados no viene desglosado por clase ni por rango de valores, así que hay que revisar los casos críticos antes de desplegar.
- Nunca debe usarse como única parada de seguridad: el autor recomienda mantener los límites duros (por ejemplo, el de 0,4 m) en código plano.
- Cobertura de entrenamiento limitada: la destilación se hizo sobre 3.000 estados muestreados; no se documenta la distribución del muestreo ni el comportamiento fuera de ella.
- Sin capacidades lingüísticas: no procesa texto, no es multilingüe y no admite tool calling, agentes ni razonamiento multi-paso.
- Sin datos publicados sobre sesgos, robustez numérica ante sensores ruidosos, calibración de las probabilidades o comportamiento con valores fuera de rango.
- Las probabilidades provienen de la destilación de un LLM y no de una calibración específica; usarlas como umbral exigiría validación propia.
- Licencia Apache-2.0, permisiva para uso comercial, pero el proyecto es no oficial y no está respaldado por AWS ni por Strands; el repo figura con 0 descargas y 0 likes, sin validación externa.
- No se dispone de información sobre la huella de memoria compilada exacta ni sobre el soporte de plataformas distintas de ESP32-S3 y portátil.
- La búsqueda web realizada no devolvió resultados relacionados con el modelo (solo referencias al ave Passer domesticus, a diccionarios y a productos homónimos), por lo que no hay fuentes independientes que verifiquen las cifras de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sparrow-decider/sparrow-pico-rover
- Repositorio principal de Sparrow Decider: https://github.com/sparrow-decider/sparrow-decider
- Guía de sparrow-pico: https://github.com/sparrow-decider/sparrow-decider/blob/main/docs/quickstart/pico.md
- Ejemplo ESP32-S3 con robot: https://github.com/sparrow-decider/sparrow-decider/tree/main/c/examples/esp32s3_robot
- Modelo profesor Strands Decider 2B: https://huggingface.co/StrandsAgents/strands-decider-2B-qwen3.5-v1-2610
- Repositorio de Strands Decider: https://github.com/strands-labs/strands-decider
- Issues: https://github.com/sparrow-decider/sparrow-decider/issues
- Discusiones: https://github.com/sparrow-decider/sparrow-decider/discussions
- Contacto: vivek@sparrowdecider.com
