# toonist/AnuLM-Smoke-30B

## Resumen

AnuLM-Smoke-30B es un checkpoint de validacion de la familia AnuLM, desarrollado por el usuario toonist (repositorio MOBIRIZER-TECHNOLOGY/AnuLM). A pesar del sufijo "30B" en el nombre, el modelo tiene 17,44 millones de parametros totales y 6,60 millones activos por token: el "30b" hace referencia al preset interno `nano_30b` de la arquitectura, no al numero de parametros. Fue entrenado durante 200 pasos sobre 1 MB de tinyshakespeare en una unica RTX 5070 Ti, en 29 segundos, con el unico proposito de probar de extremo a extremo el pipeline de entrenamiento, muestreo, exportacion, subida, descarga, carga y generacion tras el renombrado del proyecto y el cambio de identificador de formato del tokenizador.

El autor lo declara explicitamente como no utilizable como modelo de lenguaje. No es un modelo de produccion ni un modelo de investigacion con capacidades reales: es una prueba de humo del andamiaje de publicacion. Su relevancia es, por tanto, instrumental: sirve como referencia de como se empaqueta un checkpoint AnuLM (safetensors en bfloat16, tokenizador byte-level sin fichero BPE, arquitectura fuera de `transformers`) y como evidencia de la curva de desbalanceo de expertos que el proyecto documenta.

La arquitectura es un transformer MoE con GQA, 8 capas, 16 expertos enrutados con top-2 mas un experto compartido en 7 capas MoE, capa 0 densa, RoPE con theta 1.000.000, QK-norm y router sigmoide con balanceo de sesgo sin perdida auxiliar. El contexto es de 256 tokens y el vocabulario es byte-level de 259 entradas (256 bytes mas BOS/EOS/PAD), por lo que no hay fichero de tokenizador junto a los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con GQA (6 cabezas de consulta / 2 de clave-valor), 8 capas, capa 0 densa y 7 capas MoE con 16 expertos enrutados top-2 mas experto compartido; RoPE theta 1.000.000, QK-norm, router sigmoide con balanceo de sesgo sin perdida auxiliar |
| Parametros totales | 17.440.608 (17,44 M) |
| Parametros activos | 6,60 M por token (37,9 %) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | hi, en (segun metadatos); el entrenamiento real es sobre tinyshakespeare, texto en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16, sin pickle); tokenizador byte-level sin fichero asociado (259 entradas) |

## Arquitectura y entrenamiento

El modelo sigue el preset `tiny-gqa` del proyecto AnuLM: 8 capas con atencion por grupos de consulta (6 cabezas de consulta y 2 de clave-valor), una primera capa densa y siete capas de mezcla de expertos con 16 expertos enrutados, seleccion top-2 y un experto compartido adicional. El enrutador es sigmoide y utiliza un sesgo de balanceo actualizado sin termino de perdida auxiliar (`aux-loss-free bias balancing`) con `bias_update_rate=1e-3`. La normalizacion QK y RoPE con theta 1.000.000 completan el diseno. El vocabulario es byte-level puro (256 bytes mas tres tokens especiales), lo que elimina la necesidad de un tokenizador BPE y hace que la generacion sea byte a byte.

El entrenamiento se realizo desde cero el 2026-09-18 sobre tinyshakespeare (1,12 MB, 3 documentos), con 200 pasos a batch 16 y bloque de 256 tokens, lo que supone 0,82 de una epoca. Se uso AdamW fusionado con learning rate 3e-4 y decaimiento coseno, autocast en bf16 y una sola RTX 5070 Ti, con un tiempo de reloj de 29 segundos y un throughput aproximado de 29.000 tokens/s. La perdida de validacion paso de 5,6205 en el paso 0 a 1,8515 en el paso 199 (2,671 bits/byte). El desbalanceo de expertos evoluciono de 4,68x a un pico de 7,97x en el paso 20 y bajo a 1,80x al final: el autor conserva esta ejecucion precisamente porque captura la forma completa de la curva, en la que el desbalanceo sube antes de bajar porque el balanceador necesita unos 100 pasos para superar el colapso inicial del enrutador hacia los expertos favoritos. No se emplearon tecnicas de RLHF ni DPO.

## Capacidades

- Generacion de texto a nivel de byte: produce continuaciones con la forma del corpus de entrenamiento (dialogos con etiquetas de hablante), pero compuestas mayoritariamente por pseudopalabras.
- Modelado de formato: ha aprendido la estructura de tinyshakespeare (turnos de dialogo, mayusculas en los nombres de personaje) y poco mas del vocabulario.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles en la practica; los metadatos declaran hi y en, pero el entrenamiento es solo texto ingles de Shakespeare.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Generacion byte a byte: puede emitir UTF-8 invalido a mitad de secuencia, por lo que la decodificacion debe hacerse con `errors="replace"`.

## Casos de uso

- Prueba de humo del pipeline de publicacion: descargar el checkpoint, cargarlo con `load_checkpoint`, instanciar `AnuLM` y generar texto para verificar que el ciclo train-sample-export-upload-download-load-generate funciona tras un cambio de formato de tokenizador.
- Validacion de integracion con el repositorio AnuLM: comprobar que `sample.py` y `serve.py` aceptan el directorio del checkpoint y arrancan la pagina web de continuacion de texto en `http://127.0.0.1:8000`.
- Referencia de formato de pesos: servir como ejemplo minimo de `model.safetensors` en bfloat16 con configuracion embebida para quien implemente cargadores compatibles con el proyecto.
- Docencia sobre mezcla de expertos: ilustrar con una ejecucion real y reproducible la curva de desbalanceo de expertos (subida inicial y correccion posterior) en un MoE pequeno con balanceo sin perdida auxiliar.
- Test de regresion de infraestructura: ejecutar el preset `30b` con `python train.py --preset 30b --steps 200` en hardware consumer para verificar que el entorno de entrenamiento (AdamW fusionado, bf16, descarga de datos) funciona antes de lanzar los checkpoints reales de 400M.
- Comparacion de decodificacion byte-level: estudiar el comportamiento de un modelo con vocabulario de 256 bytes y contexto de 256 tokens, incluida la aparicion de UTF-8 invalido y el uso de `errors="replace"`.

## Benchmarks y rendimiento

El `model-index` de la model card declara el modelo con una lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento aportados por el autor son de entrenamiento y validacion, no de tareas estandar:

| Metrica | Valor |
|---|---|
| Perdida de validacion, paso 0 | 5,6205 |
| Perdida de validacion, paso 199 | 1,8515 |
| Bits por byte, paso 199 | 2,671 |
| Desbalanceo de expertos, inicio | 4,68x |
| Desbalanceo de expertos, pico (paso 20) | 7,97x |
| Desbalanceo de expertos, final | 1,80x |
| Throughput de entrenamiento | ~29.000 tokens/s en una RTX 5070 Ti |
| Tiempo de entrenamiento | 29 s (200 pasos) |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (17,44 M de parametros, repo de 0,1 GB); en cuantizaciones de 8 o 4 bits el peso seria de decenas de MB, aunque no se publican ficheros cuantizados.
- GPU recomendadas: cualquier GPU consumer moderna basta; el propio autor entreno el modelo en una RTX 5070 Ti. No requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con soporte de bfloat16 o float16, e incluso en CPU para inferencia a baja velocidad.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama, ya que la arquitectura no esta en `transformers`. El unico camino documentado es clonar el repositorio AnuLM y usar `sample.py` o `serve.py` apuntando al directorio del checkpoint.
- Latencia y throughput: no se publican cifras de inferencia; el modelo decodifica un byte por paso, lo que limita la velocidad de generacion de texto legible.

## Comparativa con modelos similares

No hay modelos comparables en la misma categoria: se trata de un checkpoint de prueba de 17,44 M de parametros con contexto de 256 tokens y sin benchmarks. La comparacion mas util es con los checkpoints reales del mismo proyecto, que el autor recomienda en lugar de este:

| Modelo | Parametros | Tarea | Rendimiento declarado | Licencia |
|---|---|---|---|---|
| AnuLM-Smoke-30B | 17,44 M (6,60 M activos) | Prueba de pipeline | Sin benchmarks; val loss 1,8515 | MIT |
| AnuLM-Coder-400M | ~400 M | Generacion de funciones Python | MBPP 12,5 % pass@1 | no disponible en la informacion |
| AnuLM-Translate-400M | ~400 M | Traduccion ingles-hindi | chrF 41,5 / 43,4 en FLORES-200 | no disponible en la informacion |
| AnuLM-Hindi-QA-400M | ~400 M | QA en hindi, ingles y Python | no disponible | no disponible en la informacion |
| AnuLM-Base-400M | ~400 M | Base trilingue | no disponible | no disponible en la informacion |

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable: el propio autor lo declara explicitamente. Genera pseudopalabras con la forma del corpus, no texto con sentido.
- Entrenado solo 200 pasos (0,82 de una epoca) sobre 1 MB de tinyshakespeare; no ha visto datos suficientes para adquirir vocabulario ni gramatica.
- Contexto de 256 tokens, insuficiente para cualquier tarea conversacional o de documento.
- Tokenizador byte-level: emite UTF-8 invalido a mitad de secuencia; es obligatorio decodificar con `errors="replace"`.
- Los metadatos declaran hi y en, pero el entrenamiento es unicamente texto ingles de Shakespeare; no hay capacidad multilingue real.
- Incompatible con el ecosistema estandar (`transformers`, vLLM, TGI, llama.cpp, Ollama); requiere el repositorio AnuLM.
- Riesgo de alucinacion: total, en el sentido de que toda la salida es inventada; no debe usarse para generar informacion factual.
- Sesgos: no documentados; el corpus es teatro ingles de dominio publico, con los sesgos de representacion que ello implica.
- Licencia MIT sin restricciones para uso comercial, pero el modelo no tiene aplicacion comercial practica.
- No afiliado a AI4Bharat, BharatGen ni al Gobierno de India, segun el autor.

## Enlaces

- Hugging Face: https://huggingface.co/toonist/AnuLM-Smoke-30B
- Repositorio del proyecto: https://github.com/MOBIRIZER-TECHNOLOGY/AnuLM
- Checkpoint recomendado en su lugar (codigo): https://huggingface.co/toonist/AnuLM-Coder-400M
- Checkpoint recomendado en su lugar (traduccion): https://huggingface.co/toonist/AnuLM-Translate-400M
- Checkpoint recomendado en su lugar (QA en hindi): https://huggingface.co/toonist/AnuLM-Hindi-QA-400M
- Checkpoint recomendado en su lugar (base): https://huggingface.co/toonist/AnuLM-Base-400M
