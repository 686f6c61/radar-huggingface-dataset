# yejinkim/tofu-forget05-Llama-3.1-8B-Instruct-best

## Resumen

`yejinkim/tofu-forget05-Llama-3.1-8B-Instruct-best` es un repositorio que agrupa seis checkpoints de Llama-3.1-8B-Instruct sometidos a distintos algoritmos de *machine unlearning* (olvido selectivo) sobre el subconjunto `forget05` del benchmark TOFU. No es un modelo entrenado desde cero, sino una coleccion de variantes derivadas del modelo instructivo de Meta, cada una producida con una tecnica diferente (GradDiff, NPO, SimNPO, RMU, LUNAR y TULIP) y con la mejor configuracion encontrada por el autor para esa particion concreta.

El objetivo de TOFU (Task of Fictitious Unlearning) es evaluar la capacidad de un modelo para "desaprender" informacion sobre autores ficticios sin degradar su utilidad general. `forget05` corresponde al 5 % de los perfiles que deben olvidarse, mientras que el resto del dataset (`retain`) sirve para medir la retencion de conocimiento. Por tanto, este repositorio es material de investigacion para comparar metodos de unlearning, no un modelo listo para produccion.

Cada subcarpeta contiene un checkpoint completo de Hugging Face que puede cargarse de forma independiente indicando el parametro `subfolder`. El modelo base es Llama-3.1-8B-Instruct (8 000 millones de parametros, transformer denso, contexto de 128 000 tokens), y el repositorio ocupa 90,3 GB en total al albergar las seis variantes en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (hereda la de Llama-3.1-8B-Instruct) |
| Parametros totales | 8 000 millones (8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible en el repositorio (solo pesos safetensors en precision original) |
| Idiomas soportados | no disponible en la model card; el modelo base soporta 8 idiomas oficiales (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | no disponible en el repositorio; el modelo base se distribuye bajo Llama 3.1 Community License |
| Formato de pesos | safetensors |
| Variantes incluidas | GradDiff, NPO, SimNPO, RMU, LUNAR, TULIP (6 subcarpetas) |
| Tamano del repositorio | 90,3 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.1-8B-Instruct: un transformer decoder-only denso con atencion por grupos (GQA), RoPE y contexto extendido a 128 000 tokens. Sobre esa base, el autor aplica seis algoritmos de unlearning distintos, cada uno con su propia formulacion de perdida y su propio conjunto de hiperparametros. Todos los experimentos usan 10 epocas, tasa de aprendizaje 1e-5, batch efectivo 16 y semilla 0, salvo LUNAR, que emplea su propia tasa de aprendizaje en el bucle interno.

Las configuraciones seleccionadas son: GradDiff con `g1.0_a2.0`; NPO con `b0.05_g0.5`; SimNPO con `b1.0_g7.0`; RMU con `sc2_L10` (capa 10); LUNAR con `L12_c2.0_lr0.005_seed0` (capa 12); y TULIP con `UTO_g0.02_a1_uniform_logit_break_dot_ep10_woWarmup_lstar_stable`. Cada metodo representa una familia distinta de aproximaciones al olvido: GradDiff y NPO operan sobre gradientes y preferencias, RMU y LUNAR actuan sobre representaciones internas de capas concretas, y TULIP es una variante de optimizacion unidireccional. No se detalla en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de la particion `forget05` de TOFU.

## Capacidades

- Generacion de texto instructivo, razonamiento y codigo, heredadas del modelo base Llama-3.1-8B-Instruct.
- Seguimiento de instrucciones multi-turno y conversacion.
- Soporte de tool calling y function calling (capacidad del modelo base).
- Capacidad de "olvidar" selectivamente informacion sobre el 5 % de autores ficticios del benchmark TOFU, segun el metodo aplicado.
- Cada checkpoint es autonomo y puede cargarse por separado mediante el parametro `subfolder`.
- Capacidades multilingues heredadas del modelo base (8 idiomas oficiales).
- No se documentan modos especiales adicionales (thinking, vision, audio) en la informacion disponible.

## Casos de uso

- Investigacion comparativa de algoritmos de unlearning: cargar cada subcarpeta y evaluar la misma bateria de metricas TOFU (forget quality, retain quality, model utility) para comparar GradDiff, NPO, SimNPO, RMU, LUNAR y TULIP bajo condiciones identicas de entrenamiento.
- Reproducibilidad de experimentos academicos: las configuraciones estan documentadas por metodo, lo que permite replicar resultados con semilla 0 y comparar contra publicaciones previas de TOFU.
- Estudio de compromiso olvido-retencion: analizar como cada tecnica degrada la utilidad general del modelo al aumentar la fuerza del olvido, usando el checkpoint como material de partida.
- Desarrollo de tecnicas de privacidad y cumplimiento: servir como referencia para implementar y validar mecanismos de eliminacion de datos en modelos desplegados, antes de aplicarlos a dominios reales.
- Analisis de robustez frente a ataques de extraccion: comprobar si la informacion "olvidada" es recuperable mediante prompting adversarial, comparando variantes.
- Docencia y formacion: usar los seis checkpoints como ejemplo practico de las distintas familias de metodos de unlearning en cursos de IA responsable.
- Baseline para nuevas propuestas: cualquier nuevo algoritmo de unlearning puede compararse contra estas seis variantes entrenadas con hiperparametros ya ajustados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (bf16/fp16): aproximadamente 16 GB para los pesos, mas overhead de activaciones y cache KV, lo que en la practica exige 18-24 GB.
- En cuantizacion de 8 bits: alrededor de 8-9 GB de VRAM; en 4 bits: alrededor de 5-6 GB. El repositorio no incluye pesos cuantizados, por lo que habria que generarlos a partir de los safetensors.
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion por lotes y contexto largo; RTX 4090 (24 GB) suficiente para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en bf16, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (tras conversion a GGUF), Ollama y transformers con `AutoModelForCausalLM`. Cada variante debe cargarse indicando su `subfolder`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-forget05-Llama-3.1-8B-Instruct-best (este) | 8B | 128k | Unlearning TOFU (6 metodos) | no disponible (base: Llama 3.1 Community) | Hugging Face, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8B | 128k | Instructivo general | Llama 3.1 Community License | Hugging Face, ampliamente usado |
| Otros checkpoints TOFU de Llama-3.1-8B | 8B | 128k | Unlearning TOFU (variantes) | depende del autor | disponibles en el Hub, no verificados aqui |
| Modelos de unlearning sobre Llama-2-7B (p. ej. variantes TOFU originales) | 7B | 4k | Unlearning TOFU | depende del autor | disponibles en el Hub |

La comparativa directa con otros repositorios de unlearning no puede completarse con datos verificados en la informacion proporcionada; se indica "no disponible" para las metricas de rendimiento de los competidores.

## Limitaciones y advertencias

- El repositorio no declara licencia propia; el uso comercial queda sujeto a la Llama 3.1 Community License del modelo base y a la interpretacion del autor, lo que introduce incertidumbre legal.
- No es un modelo para produccion: es material de investigacion con 0 descargas y sin pipeline declarado.
- El olvido en TOFU se evalua sobre autores ficticios; no hay garantia de que las tecnicas generalicen a datos reales ni de que resistan ataques de extraccion.
- Los metodos de unlearning pueden degradar la utilidad general del modelo; el equilibrio olvido-retencion debe medirse caso por caso.
- Riesgo de alucinacion inherente al modelo base, no mitigado por el proceso de unlearning.
- El repositorio ocupa 90,3 GB, lo que complica su descarga y almacenamiento; conviene bajar solo la subcarpeta necesaria.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.
- La fecha de creacion indicada (2026-11-26) es futura respecto a la mayoria de referencias; verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yejinkim/tofu-forget05-Llama-3.1-8B-Instruct-best
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Benchmark TOFU (paper original): no disponible en la informacion proporcionada
- Repositorio de TOFU: no disponible en la informacion proporcionada
- Papers de los metodos (GradDiff, NPO, SimNPO, RMU, LUNAR, TULIP): no disponibles en la informacion proporcionada
