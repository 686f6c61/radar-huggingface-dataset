# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch05

## Resumen

Este modelo es un checkpoint de investigacion derivado de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de un experimento de *machine unlearning* (desaprendizaje): el objetivo es eliminar selectivamente el conocimiento de un subconjunto de datos ("forget10") sin degradar el rendimiento sobre el resto ("retain"). El nombre del repositorio codifica la configuracion experimental: inicializacion de embeddings de entrada y cabeza LM desde el Phi-1.5 original, entrenamiento con perdida de entropia cruzada inversa (IHL, *inverse hinge loss*) sobre el conjunto a olvidar y entropia cruzada estandar ponderada con factor 1.0 sobre el conjunto a retener, en la epoca 5 de 20.

Arquitectura y tamano corresponden al Phi-1.5 original: un transformer decoder-only de aproximadamente 1.418 millones de parametros (1.4B), disenado por Microsoft Research para generacion de texto y codigo en ingles. El checkpoint se distribuye en formato `safetensors` (2.8 GB) con codigo personalizado (`custom_code`) y licencia Apache 2.0.

Su relevancia es acotada pero especifica: sirve como referencia reproducible para evaluar tecnicas de desaprendizaje sobre modelos de lenguaje pequenos, comparando la eficacia para borrar informacion con el coste en utilidad general. No es un modelo pensado para produccion ni para uso general, sino un artefacto de investigacion con cero descargas y cero *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 2.8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only de 1.4B parametros con atencion multi-cabeza estandar y normalizacion tipo LayerNorm, entrenado originalmente por Microsoft sobre datos de texto y codigo de "calidad de libro de texto" sinteticos y filtrados. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, que contiene 200 autores ficticios con 20 preguntas y respuestas cada uno, disenado para medir desaprendizaje.

El checkpoint aqui descrito aplica una receta de desaprendizaje con dos componentes: (1) reinicializacion de los embeddings de entrada y de la cabeza LM desde `microsoft/phi-1_5`, y (2) entrenamiento con una perdida combinada que suma una *inverse hinge loss* (IHL) sobre el conjunto `forget10` (el 10 % de los autores a olvidar) mas una entropia cruzada estandar con peso 1.0 sobre el conjunto `retain`. El entrenamiento se detiene en la epoca 5 de 20. El autor indica que el resto de pesos del transformer se mantienen desde el modelo base ajustado. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de TOFU, ni si se emplearon tecnicas de RLHF o DPO (no aplicables en este contexto de desaprendizaje).

## Capacidades

- Generacion de texto en ingles: respuesta a preguntas, continuacion de texto y formato conversacional basico heredado de Phi-1.5.
- Razonamiento y codigo: Phi-1.5 fue entrenado con enfasis en codigo Python y razonamiento basico; el checkpoint conserva esas capacidades salvo en la medida en que el desaprendizaje las haya alterado.
- Respuesta a preguntas sobre el dataset TOFU: el modelo ha sido especificamente ajustado para modificar su comportamiento sobre los autores del conjunto `forget10`.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; Phi-1.5 no incorpora modo *thinking* ni planificacion explicita.
- Capacidades especiales: no dispone de vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigacion en *machine unlearning*: sirve como checkpoint de referencia para medir la eficacia de la receta IHL + reset sobre el conjunto `forget10` de TOFU, comparando la probabilidad asignada a las respuestas de los autores olvidados frente a los retenidos.
- Evaluacion de compromiso utilidad-privacidad: permite cuantificar cuanto rendimiento general (perplejidad en `retain`, tareas estandar de lenguaje) se pierde al aplicar la perdida IHL con peso 1.0 sobre la entropia cruzada.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autonomo (con `ihl_manifest.json`), facilita repetir el pipeline de entrenamiento y verificar resultados de un articulo o linea de trabajo sobre desaprendizaje.
- Analisis de robustez frente a ataques de extraccion: se puede usar para comprobar si un adversario puede recuperar la informacion supuestamente borrada mediante *prompting* o ajuste fino posterior.
- Docencia y divulgacion: ejemplo didactico de como se modifica un modelo pequeno mediante perdidas especificas y reinicializacion parcial de pesos.
- Base para experimentos comparativos: punto de partida para probar variantes (otras epocas, otros pesos de la perdida, otras capas reinicializadas) y comparar contra este checkpoint de la epoca 5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 5,7 GB solo para pesos, mas activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 2,8 GB para pesos; con contexto de 2048 tokens y lote pequeno, el consumo total ronda los 4-6 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,5 GB; en 4 bits: en torno a 0,8-1 GB (estimaciones teoricas, no hay variantes GGUF publicadas).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 3070, RTX 4070) es suficiente en fp16; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el `custom_code`), vLLM y TGI para servicio en fp16, llama.cpp/Ollama solo si se convierten los pesos a GGUF (no publicado).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este checkpoint (IHL + reset, epoca 5) | 1.418M | no disponible | Apache 2.0 | Desaprendizaje sobre TOFU forget10 |
| locuslab/tofu_ft_phi-1.5 (base) | ~1.4B | 2048 | Apache 2.0 (heredada) | Ajuste fino TOFU sin desaprendizaje |
| microsoft/phi-1_5 (original) | 1.4B | 2048 | MIT (segun publicacion original) | Modelo base de texto y codigo |
| Otros metodos de desaprendizaje TOFU (p. ej. GradAscent, KL, NPO) | ~1.4B | 2048 | Variable | Distintas perdidas de desaprendizaje |

No se dispone de datos de rendimiento comparativo (benchmarks de desaprendizaje ni de utilidad) en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para aplicaciones de usuario final; cero descargas y cero *likes* en el momento de la consulta.
- Sesgos conocidos: hereda los sesgos de Phi-1.5 y de los datos sinteticos de entrenamiento originales; no se documentan evaluaciones de sesgo en la model card.
- Riesgo de alucinacion: alto en tareas abiertas, como en cualquier modelo de 1.4B; el desaprendizaje puede incrementar la generacion de contenido incoherente sobre los temas olvidados.
- Limitaciones de contexto e idioma: solo ingles; longitud de contexto no documentada en la model card (la del Phi-1.5 original es de 2048 tokens).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base `locuslab/tofu_ft_phi-1.5` y `microsoft/phi-1_5` pueden tener condiciones propias que conviene verificar antes de redistribuir.
- Requiere `trust_remote_code=True` por el `custom_code`, lo que implica ejecutar codigo del autor; revisar antes de desplegar.
- El objetivo del checkpoint es borrar informacion, no mejorar capacidades; su utilidad general puede ser inferior a la del modelo base.
- No se documentan garantias de que la informacion del conjunto `forget10` haya sido eliminada de forma robusta; el desaprendizaje en modelos de lenguaje es un area abierta y los ataques de extraccion pueden recuperar parte del conocimiento.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch05
- Modelo base ajustado: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU: no disponible en la informacion proporcionada
- Paper de TOFU: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
