# thefinalboss/fractus-cte-atom

## Resumen

Fractus CTE-Atom es un modelo de generacion de texto desarrollado por el usuario thefinalboss, presentado como un fork del Fractus Continuous Thought Engine (CTE). El cambio central respecto al modelo padre es el tokenizador: se elimina el BPE de GPT-2 y se sustituye por el Atomizer, un esquema de identificadores basado en bytes y limites de span con un vocabulario cerrado de 266 ids. Se trata de un modelo entrenado desde cero, no de una continuacion del checkpoint x8 del proyecto original.

La arquitectura no es un transformer convencional. El modelo mantiene un estado de pensamiento residual que avanza por una pila de bloques mediante atencion lineal fractal, integracion de Kuramoto (RK4) y una capa MoE de 128 expertos con enrutado top-2 por fase, con Siren de bajo rango. La configuracion "1B" declarada usa d_model=1280, 16 bloques y 20 cabezas, con aproximadamente 0,99B de parametros totales y 119,6M activos por token.

El proyecto se publica bajo licencia MIT y soporta ingles y frances. En el momento de la ficha no presenta descargas ni likes, el repositorio ocupa 0,0 GB y no se han publicado resultados de benchmarks estandar. La model card incide en una advertencia importante: el checkpoint es una semilla de entrenamiento, el CE forzado por profesor no equivale a habla o generacion coherente, y no debe cargarse ningun checkpoint x8 en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Continuous thought engine (no transformer): pensamiento residual, atencion lineal fractal, Kuramoto RK4 y MoE enrutado por fase |
| Parametros totales | ~0,99B |
| Parametros activos | 119,6M por token (MoE con 128 expertos, top-2) |
| Longitud de contexto | no disponible (el estado atencional y la fase persisten entre fragmentos, pero no se especifica una longitud concreta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, fr |
| Licencia | MIT |
| Formato de pesos | pytorch (no se especifica safetensors ni GGUF; tamano del repo 0,0 GB) |

Configuracion "1B" declarada: d_model=1280, 16 bloques, 20 cabezas, 128 expertos con top-2, expert_d_ff=2048, siren_rank=64, n_levels=2. Cabeza y embedding atados, con 266 ids (266 x 1280 aprox. 0,34M).

## Arquitectura y entrenamiento

El modelo sustituye la atencion softmax clasica por un esquema de pensamiento continuo. Un tick hace avanzar un pensamiento residual `h` a traves de la pila de bloques; el carry de atencion `(S, z)` y la fase de Kuramoto permanecen activos entre fragmentos. Cada bloque combina atencion lineal fractal (QKV, desplazamientos de nivel, mapa de caracteristicas ELU, atencion lineal causal y softmax sobre `level_logits`), integracion de Kuramoto mediante RK4 y una capa MoE enrutada por fase. El experto MoE es `LazyStructuredSirenLinear`, con dos modulos por experto sobre los pasos denso y disperso; tras `grow_atom` los modulos se copian de los factores apilados, de modo que el cuerpo que computa es el que crecio. La reparacion de enrutado Kuramoto aplica temperatura de puerta 2,5 y omega x4.

El tokenizador Atomizer define el flujo de ids: 0-255 corresponden a bytes UTF-8 en crudo, 256 es PAD, 257 es BOS, 258 es EOS y 259-265 son marcadores de limite tras un span (espacio 259, puntuacion 260, salto de linea 261, transicion de clase 262, max_span 263, eos-flush 264, generado 265). La codificacion cerrada para documentos de entrenamiento es `[BOS] + (bytes de payload + id de limite) x paquetes + [EOS]`; la codificacion abierta para prompts de generacion omite el EOS y el limite del fragmento no vaciado. La decodificacion descarta todo id >= 256 y aplica decodificacion UTF-8, con round-trip exacto sobre los bytes. El vocabulario es cerrado y no crece; lo que crece es el cuerpo (d_model, profundidad, expertos, osciladores, rango), y `grow_atom` rechaza cualquier cambio de vocabulario.

El entrenamiento parte del token 0 (el checkpoint registra `start_token: 0` y `parent: hf:thefinalboss/fractus-cte`). El bucle es `v4_forward_losses`, con CE por fragmentos, balance de carga, anti-repeticion y muestreo programado opcional; `--grow-at N` anyade una capa y reconstruye el optimizador. La inicializacion del embedding es N(0, 0,02); el CE de siguiente token en el paso 0 se midio en 5,592 con fraccion de eco 0,0, frente al objetivo ln(266) aprox. 5,583. El corpus inicial es `data/atom_corpus.i16`, con 1.059.743 ids Atom y dos ficheros en frances, no el flujo de fase 2 de 3,44B. Las caracteristicas de paquete (320-d) entran por `atom_feat`, con inicializacion a cero, situadas en el id de frontera. Respecto a Chinchilla sobre parametros activos: 20 x 119,6M aprox. 2,4B ids Atom, y top-4 duplicaria aproximadamente el coste activo. El autor senala que los ids Atom entrenan mas rapido que los tokens BPE porque la cabeza es de 266 en lugar de 50257, pero contienen menos texto, ya que un id es un byte.

## Capacidades

- Generacion de texto autorregresiva en formato de continuacion de prompt (codificacion abierta `encode_open`), con distribucion de siguiente id sobre el estado del motor.
- Razonamiento "continuo": el estado de pensamiento `h`, el carry de atencion `(S, z)` y la fase de Kuramoto persisten entre fragmentos en lugar de reiniciarse.
- Capacidad demostrada de memorizar y emitir una frase corta: con el prompt `abcdef ` el modelo produjo `Fractus 12345.` con precision 1 en modo forzado por profesor. El autor aclara que esto prueba que la ruta puede emitir una continuacion aprendida y no constituye una afirmacion de habla a escala 1B.
- Cabezas auxiliares de confianza y saliencia, memoria persistente, modos cognitivos y un recuperador de base de conocimiento, construidos conjuntamente en `fractus/atom_session.py`.
- Soporte multilingue limitado a ingles y frances segun la model card; el corpus inicial de ejemplo contiene ficheros en frances.
- Capacidad de decodificacion byte-exacta: la decodificacion descarta ids >= 256 y aplica UTF-8, con round-trip exacto sobre los bytes.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion sobre tokenizacion byte-level: dado que el Atomizer es el unico cambio respecto al motor padre, el modelo sirve para estudiar como afecta un vocabulario de 266 ids frente al BPE de GPT-2 en coste de cabeza, velocidad de entrenamiento y calidad del estado latente.
- Experimentacion con arquitecturas no transformer: al combinar atencion lineal fractal, Kuramoto RK4 y MoE enrutado por fase, es util para reproducir y auditar rutas de computo alternativas sobre corpus pequenos.
- Prototipado de modelo fundacional desde cero: los scripts `build_atom_corpus.py` y `train_atom_from_scratch.py` (con `--scale smoke` en CPU y `--scale 1b`) permiten montar pipelines de entrenamiento completos sobre corpus propios en formato Atom.
- Estudio de escalado MoE: con 128 expertos y top-2, el modelo es un banco de pruebas para medir el equilibrio entre parametros totales (0,99B), parametros activos (119,6M) y el objetivo de datos Chinchilla (aprox. 2,4B ids Atom).
- Exploracion de decodificacion y prompts byte-native: la codificacion abierta sin EOS ni limite de cola permite generar continuaciones sobre prefijos arbitrarios, util para analizar el comportamiento del modelo ante entradas no cerradas.
- Investigacion sobre estados persistentes de memoria: el motor mantiene memoria persistente, modos cognitivos y recuperador de conocimiento, lo que permite estudiar como se conserva informacion entre fragmentos en una arquitectura sin ventana de contexto fija.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos numericos proporcionados por el autor son los siguientes:

| Metrica | Valor |
|---|---|
| CE de siguiente token en el paso 0 (este fork) | 5,592 |
| Objetivo teorico ln(266) | aprox. 5,583 |
| Fraccion de eco en el paso 0 | 0,0 |
| Precision forzada por profesor en la frase memorizada (`abcdef ` -> `Fractus 12345.`) | 1,0 |
| CE observado en la ejecucion del modelo padre | aprox. 5-8 |
| unique@40 en la ejecucion del modelo padre | aprox. 3,3 |

El autor advierte explicitamente que un CE forzado por profesor en descenso no equivale a generacion de habla o texto coherente.

## Requisitos de hardware

- No se proporcionan requisitos de hardware en la informacion disponible.
- Estimacion derivada del recuento de parametros (no confirmada por el autor): con aprox. 0,99B de parametros totales, en fp16 el conjunto de pesos ocuparia en torno a 2 GB; en 8 bits en torno a 1 GB y en 4 bits en torno a 0,5 GB. Al ser un MoE, todos los expertos deben permanecer cargados aunque solo 2 esten activos por token, por lo que el consumo se aproxima al de los parametros totales y no al de los activos.
- Si cabe en GPU de consumidor: no confirmado. Segun la estimacion anterior, encajaria previsiblemente en GPU de consumidor con 8-16 GB en precisiones reducidas, pero no hay datos oficiales.
- Opciones de despliegue: no disponibles. La model card solo documenta ejecucion mediante `scripts/train_atom_from_scratch.py` con PyTorch (`pip install torch numpy`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, y la cabecera de 266 ids y el motor no estandar dificultan su integracion en runtimes genericos.
- Latencia y throughput: no disponibles.
- Nota operativa: el repositorio ocupa 0,0 GB, por lo que no consta que los pesos esten publicados en el momento de redactar esta ficha.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables publicados en la informacion proporcionada. El unico modelo relacionado directamente es el proyecto padre:

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thefinalboss/fractus-cte-atom | Este modelo | ~0,99B totales, 119,6M activos | no disponible | MIT | HuggingFace |
| thefinalboss/fractus-cte | Proyecto padre (BPE GPT-2) | no disponible (la card del fork cita 1,05B con la cabeza de 50257) | no disponible | no disponible | HuggingFace |

Alternativas de la misma categoria o tamano: no disponible.

## Limitaciones y advertencias

- El checkpoint es una semilla de entrenamiento, no un modelo acabado. El autor describe el entrenamiento como "sin linea de meta" y advierte que la continuacion es ilimitada, no una garantia de estabilidad.
- El CE forzado por profesor no equivale a generacion coherente. El propio autor senala que en la ejecucion padre el CE se mantuvo en torno a 5-8 mientras unique@40 era aproximadamente 3,3, lo que indica baja diversidad de salida.
- La unica demostracion de generacion es una frase corta memorizada. No hay evidencia de habla o generacion abierta a escala 1B; el autor lo indica de forma explicita.
- Riesgo de alucinacion: no evaluado ni documentado en la informacion disponible.
- Sesgos conocidos: no documentados. El corpus inicial es muy reducido (1.059.743 ids Atom y dos ficheros en frances), lo que anticipa un sesgo fuerte hacia el dominio de esos datos y una cobertura limitada del ingles.
- Cobertura idiomatica limitada: la model card solo declara en y fr, y el corpus de ejemplo es en su mayoria frances. No hay datos de rendimiento por idioma.
- Restricciones de licencia: la licencia es MIT, que en principio permite uso comercial, pero conviene verificar las condiciones de los componentes vendorizados (Atomizer, procedente de `AFKmoney/atom-ai`) antes de un uso en produccion.
- Advertencia operativa explicita: "No x8 checkpoint is in this repo. Do not load one." Cargar un checkpoint x8 en este fork no es valido.
- Incompatibilidad de vocabulario: `scripts/train_1b_gpu.py` rechaza cualquier checkpoint cuyo vocabulario no sea 266, y los shards de fase 2 y `training_corpus.pt` estan en ids GPT-2; el cargador rechaza cualquier id >= 266.
- `START_TOKEN=0` solo es legal en este modelo nuevo.
- El script `scripts/pod_atom_from_scratch.sh` no arranca a menos que `ATOM_POD=1` este definido en una maquina que ya disponga de GPU; no abre pods por si mismo.
- La seccion "What to measure" de la model card aparece truncada en la informacion recibida, por lo que las recomendaciones de evaluacion del autor estan incompletas.
- Sin benchmarks publicados: no es posible situar el modelo frente a alternativas de su categoria.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/thefinalboss/fractus-cte-atom
- Motor fuente (proyecto padre): https://huggingface.co/thefinalboss/fractus-cte
- Repositorio GitHub: https://github.com/AFKmoney/fractus-cte-atom
- Fuente del Atomizer: https://github.com/AFKmoney/atom-ai
- Paper: no disponible
- Blog o demo: no disponible
