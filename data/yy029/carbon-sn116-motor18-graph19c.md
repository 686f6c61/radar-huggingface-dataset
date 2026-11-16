# YY029/carbon-sn116-motor18-graph19c

## Resumen

Carbon `graph19c` es un modelo surrogate para el reto **Electric Motor Magnetics 1.8** de la subred 116 de Bittensor (Carbon). Desarrollado por el usuario YY029, recibe los ocho parámetros de diseño de un motor de imanes superficiales y devuelve 240 valores numéricos: el par motor en 60 posiciones angulares del rotor a lo largo de un período de 15 grados, seguidos del enlace de flujo de las fases A, B y C en esas mismas posiciones. No es un modelo de lenguaje: es un emulador físico de un solver de elementos finitos, empaquetado como grafo JAX para su validación en la red Carbon.

La propuesta técnica combina un solver de campo magnético de malla gruesa con dos redes neuronales correctoras (par y flujo). El solver aporta robustez física fuera del rango de entrenamiento, mientras que las redes corrigen el error residual de la malla gruesa armónico a armónico. El resultado es un modelo que responde en 135-147 ms por diseño en un único núcleo de CPU, con un tamaño de grafo de 32.579 bytes sobre los 32.768 permitidos por Carbon.

El modelo se envió a la puerta principal de Carbon (finney, netuid 116) el 14 de noviembre de 2026 y estaba siendo evaluado el 16 de noviembre de 2026, fecha de creación de la model card. Las cifras publicadas son mediciones propias del autor, no una nota oficial de Carbon, y así se indica explícitamente en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: solver de elementos finitos de malla gruesa + redes neuronales correctoras (ratio model, red de par, red de flujo), empaquetada como grafo JAX |
| Parámetros totales | No disponible (el grafo ocupa 32.579 bytes; las redes son de 3x58 y 2x24 unidades con pesos de 8 bits) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de 8 valores de diseño, salida de 240 valores) |
| Tipos de cuantización | Pesos de 8 bits en las redes neuronales (según la model card) |
| Idiomas soportados | No aplica (modelo numérico, no lingüístico) |
| Licencia | No disponible |
| Formato de pesos | Grafo JAX lowered (`manifest.json` más documentos forward, init y loss) y receta fuente en Python/JAX |
| Reto | `electric-motor-magnetics` 1.8 |
| Digest del grafo (SHA-256) | `sha256:4ea7f4ffa627292d3ceeda2c3cf0e6aa8682aa24426d87c3ebab4efb636ebaae` |
| Tamaño del grafo | 32.579 de 32.768 bytes permitidos |
| Configuración de entrenamiento | 1 paso, batch 1, optimizador SGD, learning rate 1.0, beta1 0 |
| Revisión de Carbon | `c065aea1d50eb2443ef197bde19cc960b64476ae` |

## Arquitectura y entrenamiento

El modelo se compone de cuatro piezas encadenadas. Primero, un solver de campo magnético (`femc.py`) que resuelve una malla de elementos finitos gruesa de un paso polar con la ley de hierro de Brauer de Carbon, evaluada en 15 posiciones del rotor por diseño. Segundo, un modelo de ratios (`disc.py`) que multiplica cada armónico de par 0 a 5 del solver grueso por uno más una función lineal del diseño; los armónicos 6 y 7 reciben factores fijos de 0.65 y 0.32 porque 15 posiciones del rotor los sobrestiman. Tercero, una red de par con tres capas ocultas de 58 unidades y pesos de 8 bits que corrige armónico a armónico lo que la malla gruesa aún falla. Cuarto, una red de flujo con dos capas ocultas de 24 unidades que corrige el enlace de flujo en circuito abierto, que determina la forma de la fuerza contraelectromotriz a corriente cero.

El entrenamiento de las redes se hizo offline sobre 46.080 resoluciones gruesas y finas del propio solver del autor, más 2.263 filas de verdad: las 194 filas públicas de TRAIN y 2.069 resoluciones de referencia ejecutadas con el kit público de Carbon. No se usó ningún dato del conjunto de verificación, banco de práctica ni exámenes de Carbon para el ajuste; esos conjuntos se emplearon solo para comprobación. El paso de entrenamiento de Carbon es único y no modifica nada, de modo que todas las semillas producen las mismas respuestas. La innovación principal es el acoplamiento physics-informed: el solver garantiza respuestas sensatas fuera del rango de entrenamiento, en saturación y a corriente cero, mientras las redes se limitan a corregir el sesgo de discretización de la malla gruesa.

## Capacidades

- Predicción del par motor en 60 posiciones angulares del rotor sobre un período de 15 grados para un motor de imanes superficiales de 8 polos y 24 ranuras.
- Predicción del enlace de flujo de las fases A, B y C en las mismas 60 posiciones angulares.
- Generalización fuera del rango de entrenamiento gracias al solver físico subyacente, con degradación controlada en saturación y a corriente cero.
- Respuesta determinista: idénticas salidas en semillas 0 y 7, y resultados idénticos por llamada individual o en lote.
- Inferencia en CPU: 135-147 ms por diseño en un único núcleo.
- Empaquetado como grafo JAX de nivel 4 para validación en la subred 116 de Bittensor.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni modalidades de texto, visión o audio.

## Casos de uso

- **Exploración de diseño de motores de imanes superficiales**: el modelo permite barrer los ocho parámetros de diseño de entrada y obtener curvas de par y flujo en 135-147 ms por evaluación en CPU, lo que hace viable la optimización de diseño sin recurrir a un solver de elementos finitos completo por cada candidato.
- **Sustituto de elementos finitos en pipelines de optimización**: integrado en un bucle de optimización bayesiana o evolutiva, el modelo sustituye al solver fino en las evaluaciones intermedias y reserva el solver completo para la validación final de los mejores candidatos.
- **Validación de minería en la subred 116 de Bittensor**: el grafo se puede enviar tal cual como propuesta de nivel 4 para el reto `electric-motor-magnetics` 1.8, usando la configuración de entrenamiento documentada en `construction_recipe.json`.
- **Estimación rápida de la forma de la fuerza contraelectromotriz**: la red de flujo corrige el enlace en circuito abierto, lo que permite evaluar la forma de la FEM inducida a corriente cero sin ejecutar un análisis de circuito abierto completo.
- **Análisis de sensibilidad paramétrica**: al ser determinista y rápido, el modelo permite calcular derivadas numéricas o mapas de sensibilidad de par y flujo respecto a cada uno de los ocho parámetros de diseño con un coste computacional bajo.
- **Docencia e investigación en surrogate modeling aplicado a magnética de motores**: la receta fuente en JAX (`femc.py`, `disc.py`, `motor_recipe.py`) sirve como ejemplo reproducible de acoplamiento entre un solver físico de malla gruesa y redes correctoras para emular un solver de elementos finitos fino.
- **Filtrado previo de candidatos en un banco de pruebas**: antes de lanzar simulaciones finas costosas, el modelo descarta diseños con errores de rizado de par o de forma de FEM por encima de umbrales configurables.

## Benchmarks y rendimiento

Mediciones propias del autor, comparando `graph19c` con la receta anterior `graph19b`. No son una nota oficial de Carbon.

| Comprobación | graph19b | graph19c |
|---|---|---|
| Total de práctica local de Carbon | 0.8438 | 0.8955 |
| Error de fracción de rizado en 518 resoluciones de referencia no vistas en rango, mediana | 0.0018 | 0.0010 |
| Igual, percentil 90 | 0.0063 | 0.0039 |
| Igual, percentil 97 | 0.0102 | 0.0066 |
| Casos de saturación, error de par pico a pico, mediana, N·m | 0.0146 | 0.0049 |
| Error de forma de la fuerza contraelectromotriz en circuito abierto, mediana | 0.0032 | 0.0011 |
| Tiempo de respuesta por diseño, un núcleo de CPU | 127-136 ms | 135-147 ms |

Comprobaciones superadas por el grafo publicado: las puertas propias de Carbon 1.8 sobre 3.694 diseños, respuestas idénticas en semillas 0 y 7, y respuestas idénticas por llamada individual y en lote. Las resoluciones de referencia de la tabla nunca fueron vistas por las redes evaluadas: las versiones de hold-out se ajustaron sin ellas, mientras que las redes publicadas usan todas las filas.

## Requisitos de hardware

- Inferencia en CPU: 135-147 ms por diseño en un único núcleo, según medición del autor.
- VRAM estimada para GPU: no disponible; el grafo es de 32.579 bytes y está pensado para ejecución en CPU dentro del validador de Carbon.
- GPU recomendadas: no disponible; no se documenta despliegue en GPU.
- Cabe en cualquier hardware capaz de ejecutar JAX en CPU; no requiere GPU de consumo.
- Opciones de despliegue: herramientas de minería de Carbon (`carbon.level4.tooling`) para rebajar la receta y validar el grafo; ejecución directa del grafo JAX lowered.
- Throughput estimado: aproximadamente 6,8 a 7,4 diseños por segundo por núcleo de CPU, derivado del tiempo por diseño documentado.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada/salida | Tiempo por diseño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carbon `graph19c` (este) | Surrogate FEM + redes correctoras | 8 entradas / 240 salidas | 135-147 ms (1 núcleo CPU) | No disponible | Hugging Face, pendiente de nota |
| Carbon `graph19b` | Surrogate FEM + redes correctoras (receta previa) | 8 entradas / 240 salidas | 127-136 ms (1 núcleo CPU) | No disponible | Referenciado en la model card, no enlazado |
| Solver de elementos finitos fino de Carbon | Solver numérico | 8 entradas / 240 salidas | No disponible (previsiblemente mucho mayor) | No disponible | Kit público de Carbon |
| Otros modelos de la subred 116 | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos públicos de otros modelos comparables de la misma subred ni de sus métricas, por lo que la comparativa se limita a la receta previa del mismo autor y al solver fino de referencia.

## Limitaciones y advertencias

- **Sin nota oficial**: el modelo se envió el 14 de noviembre de 2026 y estaba en evaluación el 16 de noviembre de 2026; las cifras de la tabla son mediciones propias y no deben interpretarse como una calificación de Carbon.
- **Evaluación única por receta**: Carbon califica una receta idéntica una sola vez, de modo que reenviar exactamente estos archivos devuelve la nota de la primera copia.
- **Rango de validez limitado**: las correcciones se ajustaron para la caja de entrada de Motor 1.8 y su entorno inmediato; muy fuera de ese rango solo el solver de campo mantiene la coherencia de la respuesta.
- **Solver específico de una máquina concreta**: el solver de campo está construido para el marco fijo de Carbon (8 polos, 24 ranuras); no es un solver de motores general.
- **Sesgo de la malla gruesa**: los armónicos 6 y 7 usan factores fijos (0.65 y 0.32) en lugar de correcciones ajustadas, lo que puede introducir error sistemático en esos componentes.
- **Riesgo de extrapolación silenciosa**: al no haber un indicador de confianza en la salida, un uso fuera del dominio previsto puede devolver valores plausibles pero incorrectos sin aviso.
- **Licencia no especificada**: no se declara licencia, lo que impide determinar las condiciones de uso comercial; el repositorio se comparte "tal cual, sin garantía".
- **Sin datos de sesgo lingüístico ni de alucinación**: al no ser un modelo de lenguaje, estas categorías no aplican, pero tampoco hay auditoría de errores físicos más allá de las comprobaciones descritas.
- **Sin claves ni registros de envío**: el repositorio no incluye claves, carteras ni registros de submission.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/YY029/carbon-sn116-motor18-graph19c
- Subred 116 de Bittensor (Carbon): no disponible en la información proporcionada
- Paper o blog del reto Electric Motor Magnetics 1.8: no disponible en la información proporcionada
- Repositorio del kit público de Carbon: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
