# xixibuxixi/stateplay-mixed-sf3-kof98-reward-model-v3

## Resumen

StatePlay SF3/KOF98 reward model v3 es un adaptador LoRA de tipo reward model desarrollado por el usuario xixibuxixi, construido sobre el modelo base Qwen/Qwen3.5-9B. Su funcion es actuar como modelo de recompensa congelado ("frozen video reward model") dentro de un pipeline de aprendizaje por refuerzo denominado StatePlay, entrenado sobre una mezcla de contenido de los videojuegos Street Fighter III (SF3) y The King of Fighters '98 (KOF98). El adaptador se publica como artefacto final de un entrenamiento de 300 pasos.

El modelo no es un modelo generativo de proposito general, sino un componente especializado de un sistema RL: recibe entradas multimodales (video preprocesado) junto con un prompt de puntuacion propietario de StatePlay y devuelve una puntuacion de recompensa. El repositorio contiene exclusivamente el adaptador PEFT (0,3 GB), el procesador y el tokenizador, junto con ficheros de integridad (`FINAL.json`, `SHA256SUMS`).

La relevancia de esta ficha es limitada y debe enmarcarse con honestidad: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin licencia declarada y sin evaluacion de calidad independiente segun el propio autor. Es util unicamente para quien quiera reproducir el protocolo de puntuacion de StatePlay, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen/Qwen3.5-9B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 9B segun su denominacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT) + procesador y tokenizador en `processor/` |
| Tamano del repositorio | 0,3 GB |
| Entrenamiento | 300 pasos, LoRA, tarea reward modeling |
| Modelo base | Qwen/Qwen3.5-9B |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) cargado mediante la libreria PEFT sobre el modelo base Qwen/Qwen3.5-9B, un transformer denso de la familia Qwen. No se dispone de informacion sobre el rango del adaptador, las capas objetivo, el learning rate ni la composicion exacta del dataset de entrenamiento; la model card solo indica que se trata del adaptador final de 300 pasos usado como reward model congelado en una ejecucion RL mixta de SF3 y KOF98.

El entrenamiento se enmarca en el pipeline StatePlay, que segun la model card emplea un "scoring prompt" original y un preprocesamiento de video especifico para producir puntuaciones de recompensa sobre gameplay. El autor declara que el checkpoint paso una recarga en frio exacta ("exact fresh reload"), lo que valida la integridad de la serializacion, pero explicitamente senala que una evaluacion de calidad independiente quedo fuera del alcance de esa comprobacion. No se documentan tecnicas adicionales como RLHF, DPO, decodificacion especulativa ni atención lineal.

## Capacidades

- Puntuacion de recompensa sobre video preprocesado: funcion principal del adaptador, orientada a alimentar un bucle de RL.
- Procesamiento multimodal de entrada: el repositorio incluye procesador, lo que sugiere entrada de video/imagenes ademas de texto, aunque la model card no detalla la modalidad exacta.
- Integracion con PEFT: se carga como adaptador sobre Qwen/Qwen3.5-9B, sin necesidad de fusionar pesos.
- Reproducibilidad del protocolo StatePlay: pensado para replicar la puntuacion con el prompt original y el mismo preprocesamiento.
- Generacion de texto, razonamiento, codigo, matematicas o tool calling: no disponible como capacidad declarada del adaptador; dependeria del modelo base y no es el proposito del artefacto.
- Soporte de agentes o multi-step reasoning: no disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Reproduccion de experimentos RL de StatePlay: cargar Qwen/Qwen3.5-9B, aplicar el adaptador de `adapter/` y el procesador de `processor/`, y ejecutar el scoring prompt original para obtener recompensas comparables a las del entrenamiento.
- Investigacion en reward modeling para videojuegos de lucha: usar el adaptador como referencia para estudiar como se puntua gameplay de SF3 y KOF98 en un entorno RL controlado.
- Baseline en experimentos de RL con recompensa aprendida: emplear el modelo congelado como reward model de referencia frente a alternativas propias, manteniendo fijo el resto del pipeline.
- Auditoria de integridad de artefactos: verificar los ficheros publicados con `SHA256SUMS` y contrastar los metadatos de `FINAL.json` antes de integrar el adaptador en un pipeline.
- Docencia y divulgacion sobre PEFT: ilustrar como se publica un adaptador LoRA de reward modeling con su procesador y tokenizador asociados.
- Pruebas de compatibilidad de despliegue: validar la carga del adaptador en stacks PEFT sobre el modelo base para comprobar que la recarga en frio funciona en el entorno propio del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion de calidad independiente quedo fuera del alcance de la comprobacion realizada por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base Qwen/Qwen3.5-9B y de su cuantizacion. Como referencia orientativa no verificada, un modelo denso de 9B en FP16 requiere del orden de 18 GB solo para pesos, y en cuantizaciones de 8 o 4 bits aproximadamente 9-10 GB y 5-6 GB respectivamente; estas cifras son estimaciones genericas y no estan confirmadas para este modelo base.
- GPU recomendadas: no disponible. Para el modelo base de 9B, GPUs con 24 GB o mas (RTX 4090, A100, H100) serian el rango habitual, sin confirmacion del autor.
- Compatibilidad con GPU de consumo: no confirmada; previsiblemente viable en RTX 4090 o superiores con cuantizacion, pero sin datos del autor.
- Opciones de despliegue: carga via PEFT sobre transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El adaptador LoRA requeriria fusion o soporte especifico en esos stacks.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de reward modeling especificos para gameplay de SF3/KOF98, ni el autor ofrece comparaciones. Como referencia estructural, el artefacto es un adaptador LoRA sobre Qwen/Qwen3.5-9B, por lo que su comportamiento hereda las caracteristicas del modelo base, del que tampoco se aportan datos comparativos en esta ficha.

## Limitaciones y advertencias

- Sin evaluacion de calidad independiente: el propio autor indica que la comprobacion realizada se limito a una recarga en frio exacta, no a una validacion de calidad.
- Licencia no declarada: no se especifica licencia, lo que impide determinar si el uso comercial esta permitido. Debe asumirse restriccion hasta confirmacion del autor.
- Idiomas no declarados: no hay informacion sobre cobertura linguistica.
- Especializacion extrema: el adaptador esta entrenado para un unico protocolo de puntuacion (StatePlay con prompt original y preprocesamiento de video concreto); usarlo fuera de ese protocolo probablemente produzca puntuaciones sin significado.
- Dependencia del modelo base: requiere Qwen/Qwen3.5-9B y su procesador; cualquier cambio en el prompt, el preprocesamiento o la version del modelo base puede alterar las recompensas.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado; al ser un reward model, el riesgo relevante es de puntuaciones erroneas o sesgadas que degraden el entrenamiento RL.
- Adopcion nula verificable: cero descargas y cero likes en el momento de la consulta, sin senales de uso comunitario ni mantenimiento.
- Fecha de creacion futura en los metadatos (2026-11-10): conviene verificar la procedencia y autenticidad del repositorio antes de integrarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/xixibuxixi/stateplay-mixed-sf3-kof98-reward-model-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales.
