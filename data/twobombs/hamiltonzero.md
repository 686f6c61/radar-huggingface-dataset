# Twobombs/HamiltonZero

## Resumen

HamiltonZero es un modelo de investigación desarrollado por Simulacra Research (publicado bajo el usuario Twobombs) que implementa funciones de onda neuronales compiladas para Hamiltonianos de espín cuánticos. A diferencia de los modelos de lenguaje convencionales, este modelo no genera texto, sino que calcula propiedades físicas como la energía local y el espín local de sistemas de espines interactuantes. Su relevancia radica en ofrecer un flujo de trabajo completo que combina un router aprendido para seleccionar permutaciones de sitios y una fase de compilación que produce una función de onda adaptada al sistema específico.

El checkpoint fundacional se distribuye en formato Equinox (`.eqx`) y requiere JAX con un fork específico (`TakeOver/jax`) que incorpora soporte para JVP simbólico, necesario para el kernel de atención Pallas afinado. El modelo está diseñado para ejecutarse en aceleradores compatibles con JAX y expone una API de Python que integra NetworkX para la construcción de Hamiltonianos. Aunque el repositorio tiene un tamaño de 2.2 GB, no se especifica el número de parámetros ni la arquitectura detallada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para funciones de onda (detalles no especificados; incluye router aprendido y kernel de atención Pallas) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de física cuántica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable |
| Licencia | apache-2.0 |
| Formato de pesos | Equinox (`.eqx`) con manifiesto en `config.json` |

## Arquitectura y entrenamiento

La arquitectura de HamiltonZero se basa en una función de onda neuronal compilada para Hamiltonianos de espín, con un componente de router aprendido que selecciona una permutación de sitios antes de compilar la función de onda final. El modelo utiliza JAX como framework y requiere un fork específico de JAX (`TakeOver/jax`) que añade soporte para JVP simbólico, empleado por un kernel de atención Pallas afinado. No se proporcionan detalles sobre el número de capas, la dimensionalidad interna ni el número de parámetros.

El entrenamiento contempla tres flujos: entrenamiento multisistema con router aprendido, ajuste fino compilado para un solo sistema y evaluación compilada con opción de concurso de router o ejecución de gran N. El entrenamiento con router requiere ocho aceleradores visibles y un tamaño de lote MCMC divisible por ocho; el ajuste fino usa todos los aceleradores visibles. No se especifica la composición del dataset de entrenamiento ni el número de pasos, tokens o técnicas como RLHF o DPO.

## Capacidades

- Cálculo de energía local (total, exchange, casimir y campo) para Hamiltonianos de espín.
- Estimación de espín local complejo en el orden enrutado `(site, x/y/z)`.
- Inferencia compilada: carga el checkpoint, ejecuta el router beam-8, permuta el Hamiltoniano y compila la función de onda física seleccionada en una sola llamada.
- Soporte para Hamiltonianos definidos mediante NetworkX, con acoplamientos J escalares, diagonales de longitud tres o matrices 3×3, y campos h escalares o vectores de longitud tres.
- Replica-exchange MCMC integrado para muestreo de configuraciones.
- Permutación de sitios devuelta como `order`, con mapeos `leaf_to_input` e `input_to_leaf` para interpretar el orden compilado.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento conversacional.

## Casos de uso

- Estudio de cadenas de espín unidimensionales: el modelo puede calcular la energía del estado fundamental y la correlación de espín para cadenas tipo Heisenberg, como el ejemplo `chain_8` incluido en el repositorio.
- Simulación de modelos J1-J2 en redes periódicas: el notebook `examples/j1j2_4x4_route.ipynb` construye un modelo 4×4 periódico y visualiza la permutación del router, útil para investigar frustración magnética.
- Análisis de sistemas con acoplamientos anisotrópicos: al aceptar matrices de intercambio 3×3, permite estudiar Hamiltonianos con interacciones Dzyaloshinskii-Moriya o de tipo XY.
- Validación de métodos variacionales cuánticos: al proporcionar energía local y espín local, sirve como referencia para comparar con otros ansatz (p. ej., DMRG o redes tensoriales).
- Exploración de rutas de compilación: el router aprendido sugiere permutaciones de sitios que pueden reducir la complejidad de la función de onda, útil para optimizar representaciones de estados cuánticos.
- Integración en pipelines de investigación con JAX: al ser una librería Python, puede incorporarse en flujos de trabajo de simulación cuántica que ya usan JAX, aprovechando la aceleración en GPU/TPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como energía por sitio, errores relativos frente a soluciones exactas o comparaciones con otros métodos.

## Requisitos de hardware

- Requiere Python 3.12 y drivers de acelerador compatibles con JAX.
- El entrenamiento con router aprendido necesita ocho aceleradores visibles (GPU/TPU) y un lote MCMC divisible por ocho.
- El ajuste fino usa todos los aceleradores visibles, con lote MCMC divisible por su número.
- La evaluación selecciona un subconjunto de dispositivos compatible con el tamaño de lote de walkers.
- El checkpoint pesa 2.2 GB, por lo que cabe en GPUs con al menos 4 GB de VRAM, aunque el uso real dependerá del tamaño del sistema y del lote MCMC.
- No se especifican GPUs concretas recomendadas; se asume cualquier acelerador soportado por JAX (NVIDIA, AMD, TPU).
- Opciones de despliegue: no se mencionan vLLM, llama.cpp u Ollama; el modelo se ejecuta como librería JAX nativa.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (funciones de onda neuronales para Hamiltonianos de espín) dentro de la información proporcionada. Alternativas conocidas como FermiNet o PauliNet no están referenciadas en el repositorio, por lo que no se puede establecer una comparación objetiva.

## Limitaciones y advertencias

- Es un modelo de investigación sin documentación sobre sesgos o riesgos de alucinación (al no ser generativo, el concepto de alucinación no aplica directamente).
- Requiere un fork específico de JAX (`TakeOver/jax`) que no es el JAX estándar; esto puede complicar la instalación en entornos con versiones fijas.
- No se especifican límites de tamaño de sistema; el parámetro `n_max` debe configurarse según el ancho del sistema, lo que implica que sistemas muy grandes pueden requerir mucha memoria.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo de física, su utilidad comercial es limitada fuera de investigación.
- No hay garantías de rendimiento numérico para todos los tipos de Hamiltonianos; el modelo podría fallar en sistemas con interacciones de largo alcance o topologías complejas.
- El repositorio no incluye ejemplos de validación contra soluciones exactas, por lo que el usuario debe verificar la precisión para su caso concreto.

## Enlaces

- Repositorio HuggingFace: [Twobombs/HamiltonZero](https://huggingface.co/Twobombs/HamiltonZero)
- Fork de JAX requerido: [TakeOver/jax commit](https://github.com/TakeOver/jax/commit/79f82535b15a444516d4a5e2beb71d283665b2ff)
