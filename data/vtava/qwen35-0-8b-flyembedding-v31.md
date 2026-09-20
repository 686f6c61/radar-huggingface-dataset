# vtava/Qwen35-0.8B-FlyEmbedding-v31

## Resumen

Qwen35-0.8B-FlyEmbedding-v31 es un checkpoint de investigación publicado por el usuario vtava dentro del proyecto TinyCeNN-LM. Se construye sobre el modelo base Qwen/Qwen3.5-0.8B y le incorpora un adaptador residual denominado FlyEmbedding-v3.1, descrito por el autor como "preservation-first" (preservación prioritaria), es decir, diseñado para modificar la representación interna del modelo base sin degradar en exceso su comportamiento original. El repositorio pesa 2,0 GB e incluye 1.006.672.704 parámetros reales según los ficheros safetensors, lo que supone aproximadamente 0,2 B de parámetros adicionales sobre los 0,8 B del modelo base.

El problema que aborda es de tipo metodológico más que de producto: evaluar si un adaptador residual puede alterar la geometría de embeddings de un transformer pequeño manteniendo la fidelidad funcional respecto al modelo original. Para ello el autor registra métricas de preservación durante el entrenamiento, como la divergencia KL y la coincidencia top-1 respecto a las salidas del modelo base. Es relevante ahora porque se enmarca en la línea de investigación sobre adaptadores ligeros y control del olvido catastrófico en modelos de menos de 2.000 millones de parámetros.

Se trata de un artefacto de investigación, no de un modelo listo para producción: la model card indica explícitamente que la calidad de generación puede diferir sustancialmente del modelo base y que las métricas guardadas son las producidas por el cuaderno de entrenamiento, no resultados de evaluación de referencia. El repositorio no declara licencia, idiomas soportados ni composición del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-0.8B (transformer) + adaptador residual FlyEmbedding-v3.1 "preservation-first" |
| Parametros totales | 1.006.672.704 (~1,01 B) segun safetensors |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 2,0 GB |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Pipeline declarado | text-generation |
| Tipo de artefacto | checkpoint de investigacion (TinyCeNN-LM) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3.5-0.8B, un transformer denso de aproximadamente 0,8 B de parámetros, y añade un adaptador residual denominado FlyEmbedding-v3.1. El autor lo describe como "preservation-first", lo que sugiere que el objetivo de entrenamiento incorpora un término explícito de preservación del comportamiento del modelo base, penalizando la divergencia respecto a sus salidas. El incremento de parámetros respecto al base (de ~0,8 B a ~1,01 B) indica que el adaptador no es puramente de bajo rango, sino que introduce un número apreciable de pesos nuevos.

No se especifica el número de tokens de entrenamiento, la composición del dataset (el campo aparece literalmente como "Not recorded") ni si se emplearon técnicas de alineación como RLHF, DPO o SFT. Sí se documenta un punto de control del entrenamiento: el criterio de parada se alcanzó al cruzar una "frontera de preservación" en el paso 100, con una coincidencia top-1 de 0,984375 y una divergencia KL de 0,000834 respecto al modelo base. Estas cifras son métricas internas del proceso de entrenamiento, no resultados de evaluación sobre conjuntos de referencia.

El repositorio conserva artefactos por marca temporal bajo `runs/`, junto con ficheros como `flyembedding_report.json`, `lm_eval_fly_results.json` y `lm_eval_qwen_results.json`, que permiten reproducir la comparación entre el modelo adaptado y el base. La reproducibilidad se apoya en los cuadernos de Colab del repositorio GitHub del proyecto.

## Capacidades

- Generacion de texto autoregresiva, heredada del pipeline `text-generation` del modelo base.
- Modelado de lenguaje (`language-modeling`), segun las etiquetas del repositorio.
- Uso conversacional basico, segun la etiqueta `conversational`.
- Modificacion experimental de la representacion de embeddings mediante el adaptador FlyEmbedding-v3.1.
- Preservacion medida del comportamiento del modelo base: top-1 de 0,984375 y KL de 0,000834 en el punto de parada registrado.
- Compatibilidad declarada con endpoints de inferencia (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades multimodales (vision, audio), modo thinking u otras: no disponible.

## Casos de uso

- Investigacion sobre adaptadores residuales: el checkpoint sirve para reproducir el experimento de FlyEmbedding-v3.1 sobre Qwen3.5-0.8B y analizar la relacion entre divergencia KL y calidad de generacion en modelos de ~1 B.
- Estudio del olvido catastrofico en modelos pequenos: la metrica de preservacion permite cuantificar cuanto se desvia el modelo adaptado del base tras 100 pasos de entrenamiento.
- Prototipado en entornos con recursos limitados: con ~1,01 B de parametros y 2,0 GB de pesos en safetensors, el modelo cabe en GPU de gama media y en equipos de desarrollo convencionales.
- Docencia y formacion en ajuste fino: el par de ficheros `lm_eval_fly_results.json` y `lm_eval_qwen_results.json` facilita comparar el antes y el despues del adaptador en un caso real.
- Pruebas de integracion con la libreria transformers: al declararse `endpoints_compatible` y usar safetensors, puede cargarse como cualquier modelo de `text-generation` para validar pipelines internos.
- Base para experimentos de destilacion o compresion: al ser un checkpoint pequeno, es un candidato razonable para probar cuantizacion agresiva y medir la degradacion resultante.
- Evaluacion de metodologias de parada temprana: el criterio de "frontera de preservacion" documentado puede reutilizarse como heuristica de parada en otros entrenamientos.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni tareas criticas: no hay evidencia publicada de calidad, licencia ni evaluacion de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye metricas internas del proceso de entrenamiento, que no constituyen evaluacion de referencia:

| Metrica (interna de entrenamiento) | Valor |
|---|---|
| `stop_reason` | preservation boundary crossed at step 100 |
| Coincidencia top-1 frente al base | 0,984375 |
| Divergencia KL frente al base | 0,000834 |

El autor advierte explicitamente que, salvo que se marque como evaluacion en conjunto reservado, estas metricas no deben tratarse como resultados de benchmark de grado publicable.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,0 GB de pesos en FP16/BF16 (1.006.672.704 parametros x 2 bytes), mas cache KV y activaciones; en la practica, entre 3 y 5 GB para contexto moderado y lote pequeno.
- En INT8: ~1,0 GB de pesos; en INT4: ~0,5-0,6 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090). Para lotes grandes o contexto largo, A100 o H100 aportan margen, pero no son necesarias por tamano de modelo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU con 8 GB o mas, e incluso en Apple Silicon y en CPU con memoria suficiente (aunque sin pesos GGUF publicados el despliegue en CPU es menos directo).
- Opciones de despliegue: transformers (formato nativo del repositorio); vLLM y TGI son compatibles en teoria con safetensors de transformers, pero no hay configuracion publicada. No hay pesos GGUF, por lo que llama.cpp y Ollama requeririan conversion previa por parte del usuario.
- Latencia y throughput estimados: no disponible. No se publican mediciones de velocidad ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos oficiales del modelo base Qwen3.5-0.8B en la informacion proporcionada (contexto, licencia e idiomas aparecen como no disponibles en este repositorio). La comparativa se limita por tanto al propio par base/adaptado y a referencias de la misma categoria, cuyos datos deberian verificarse en sus fichas oficiales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| vtava/Qwen35-0.8B-FlyEmbedding-v31 | ~1,01 B | no disponible | no disponible | HuggingFace, safetensors | Checkpoint de investigacion con adaptador FlyEmbedding-v3.1 |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible en esta informacion | no disponible en esta informacion | HuggingFace | Modelo de partida; calidad de generacion de referencia |
| Qwen2.5-1.5B | ~1,54 B | 32.768 tokens (ampliable con YaRN) | Apache-2.0 | HuggingFace | Alternativa madura de tamano cercano con licencia permisiva |
| Llama-3.2-1B | ~1,24 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace | Alternativa con contexto largo y licencia con restricciones |

Los datos de Qwen2.5-1.5B y Llama-3.2-1B no provienen de la informacion suministrada en esta busqueda y deben confirmarse en sus fichas oficiales antes de usarse en una decision tecnica.

## Limitaciones y advertencias

- Es un checkpoint de investigacion: el propio autor indica que la calidad de generacion puede diferir sustancialmente del modelo base.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido. En ausencia de licencia explicita, debe asumirse que no hay autorizacion clara.
- El dataset de entrenamiento figura como "Not recorded", por lo que no es posible auditar la composicion de los datos ni los sesgos heredados.
- No se declaran idiomas soportados; el comportamiento multilingue es desconocido.
- Las metricas publicadas (top-1 = 0,984375; KL = 0,000834) son internas del entrenamiento y no evaluaciones sobre conjuntos reservados; no permiten inferir calidad en tareas reales.
- Riesgo de alucinacion: no evaluado ni documentado.
- La longitud de contexto efectiva del modelo adaptado no se especifica; el adaptador podria alterar el comportamiento en contextos largos.
- Sin pesos GGUF, AWQ ni GPTQ publicados, el despliegue eficiente en CPU o en GPUs con poca memoria exige conversion manual.
- Repositorio sin descargas ni valoraciones en el momento de la consulta, sin adopcion verificable por terceros.
- La busqueda web realizada no devolvio informacion tecnica relevante sobre este modelo; los resultados obtenidos correspondian a un servicio financiero no relacionado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vtava/Qwen35-0.8B-FlyEmbedding-v31
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Codigo fuente del proyecto TinyCeNN-LM: https://github.com/vtavakkoli/TinyCeNN-LM
- Resultados de busqueda web: sin enlaces relevantes; los resultados devueltos correspondian a dominios ajenos al modelo (gemini.com) y no se incluyen.
