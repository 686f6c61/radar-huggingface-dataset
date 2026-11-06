# tskim81/connectailab-rl-kimtaesun-avoid-obstacles-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B que actúa como política de decisión para un robot simulado de navegación con evitación de obstáculos. El modelo recibe una descripción textual del estado del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra correspondiente a una de cinco acciones discretas que el robot ejecutará durante los siguientes 0,5 segundos. Lo desarrolla Kim Tae-sun (tskim81) en el marco del proyecto educativo y de investigación CONNECT AI LAB en colaboración con AI CITY BUILDERS.

La particularidad del enfoque es el pipeline de destilación: primero se entrena una política PPO en un entorno de aprendizaje web (tarea `follow_route`, observación de 27 dimensiones, 5 acciones), después se generan pares estado-texto/acción a partir de las trazas de esa política, se hace un ajuste supervisado con LoRA sobre el modelo base y finalmente se refina con RL (PPO con penalización KL) usando como señal de recompensa el retorno que habría obtenido la política profesora. El resultado es un modelo de lenguaje pequeño que emula el comportamiento de un controlador de robot sin necesidad de ejecutar la red neuronal original.

Es relevante como ejemplo reproducible de cómo un LLM de menos de mil millones de parámetros puede sustituir a un controlador especializado en una tarea acotada, con métricas de éxito publicadas (75 % de episodios completados frente al 100 % de la política profesora). No es un modelo de propósito general: su utilidad está estrictamente limitada al formato de pregunta-respuesta definido por el proyecto y al simulador 2D empleado para la evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | No disponible (modelo base Qwen3.5-0.8B; el adaptador LoRA añade un número no especificado) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no especificada en la model card) |
| Tipos de cuantización | No disponible (el repo contiene safetensors del adaptador; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Coreano (`ko`), según la model card; el prompt de sistema está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA montado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. No se modifican los pesos del modelo base; el adaptador se carga con `PeftModel.from_pretrained`. La tarea se formula como clasificación generativa de una sola letra entre cinco opciones (A–E), con un prompt de sistema que instruye al modelo a tratar el contenido del campo `state` como datos y no como instrucciones, y a devolver únicamente la letra seleccionada.

El entrenamiento tiene tres fases documentadas. Primero, una política PPO se entrena en el entorno web `follow_route` (observación de 27 dimensiones, 5 acciones, curso `random`, identificador de curso `69299c1d`). Segundo, se generan 1.269 ejemplos de entrenamiento, 213 de validación y 323 de prueba a partir de las trazas de la política: cada 0,5 segundos se serializa la observación a texto y se etiqueta con la acción elegida por la política profesora, incluyendo un 20 % de ejemplos con acciones alternativas que provocaron desviaciones del recorrido. Tercero, se aplica ajuste supervisado con LoRA y después RL con PPO y anclaje KL, donde la recompensa de cada opción se calcula como el retorno que habría obtenido la política profesora si hubiera continuado desde esa acción.

La evaluación se realiza con una aproximación 2D del caminado basada en una tabla de velocidades por comando (derivada de MuJoCo web), no con el simulador físico completo ni con la red neuronal de marcha. Esto implica que las tasas de éxito reportadas no incorporan caídas ni dinámica de contacto real.

## Capacidades

- Clasificación de decisión discreta: dado un estado textual del robot, devuelve una de cinco letras de acción.
- Seguimiento de rutas con evitación de obstáculos en el simulador 2D del proyecto.
- Formato de salida restringido: una sola letra, sin explicación, según el prompt de sistema indicado.
- Resistencia a inyección de instrucciones en el campo `state` (el prompt de sistema lo declara explícitamente como datos).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe no documentada más allá del coreano indicado en los metadatos; el prompt de sistema está en inglés.

## Casos de uso

- Docencia de refuerzo y destilación: reproducir el pipeline completo (PPO → recolección de trazas → SFT con LoRA → PPO con KL) en un cuaderno de Colab para ilustrar cómo se destila una política en un LLM.
- Control de robot simulado en entornos educativos: sustituir la red de política por el LLM en el bucle de decisión del simulador web, verificando que el comportamiento se mantiene dentro de los márgenes reportados (75 % de éxito en 20 episodios).
- Investigación en interpretabilidad de políticas: al expresar el estado como texto, se pueden analizar las decisiones del modelo con herramientas de atribución lingüística, algo imposible con una política neuronal opaca.
- Prototipado de interfaces estado-texto-acción: usar el formato de pregunta/respuesta del proyecto como plantilla para otras tareas de control discreto con observaciones serializables.
- Evaluación comparativa de métodos de alineación: el par SFT (86,4 % de coincidencia con la profesora, 65 % de éxito) frente a RL (84,5 %, 75 %) sirve como caso de estudio de que una mayor fidelidad a la profesora no implica mejor rendimiento en la tarea final.
- Generación de datos sintéticos de decisión: emplear el modelo como etiquetador rápido de estados textuales en pipelines de aumento de datos para entrenar controladores más ligeros.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. La métrica «acierto» es la coincidencia con la acción de la política profesora; «éxito» es completar el recorrido en 20 episodios (semillas 91001–91020) con la aproximación 2D de caminado.

| Modelo | Acierto en test | Éxito (20 episodios) | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Política profesora (PPO) | 100,0 % | 100 % | 15 % | 26,6 s |
| Sin entrenar (base) | 42,4 % | 0 % | 15 % | — |
| SFT con LoRA | 86,4 % | 65 % | 55 % | 28,7 s |
| RL con LoRA (modelo publicado) | 84,5 % | 75 % | 15 % | 25,2 s |

Tamaños de los conjuntos: 1.269 ejemplos de entrenamiento, 213 de validación y 323 de prueba. El autor reporta que el techo de acierto (coincidencia de la política profesora consigo misma al serializar el estado a texto) es del 100 %.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA es de tamaño despreciable; el coste lo determina Qwen3.5-0.8B. En fp16, aproximadamente 1,6 GB de pesos más caché KV y activaciones; en 4 bits, por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente. RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema; el modelo está sobredimensionado para estas GPUs y el cuello de botella será la latencia del bucle de control, no la memoria.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas de los últimos ocho años, y probablemente en CPU con llama.cpp si se convierte el modelo fusionado a GGUF (no se distribuye en ese formato).
- Opciones de despliegue: `transformers` + `peft` (flujo documentado por el autor), vLLM o TGI tras fusionar el adaptador con `merge_and_unload()`, y llama.cpp/Ollama con la misma conversión previa.
- Latencia y throughput: no disponibles. Para el bucle de control a 2 Hz (decisión cada 0,5 s) conviene medir la latencia real en el hardware objetivo antes de desplegar.

## Comparativa con modelos similares

No se conocen adaptadores públicos directamente comparables (LLM pequeños destilados de políticas PPO para control de robots en simulación 2D). Se compara con el modelo base y con la política profesora, que son las referencias naturales del proyecto.

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8 B + LoRA | No disponible | 84,5 % de acierto; 75 % de éxito en 20 episodios | Apache 2.0 | Hugging Face (adaptador) |
| Qwen3.5-0.8B sin ajustar | 0,8 B | No disponible | 42,4 % de acierto; 0 % de éxito | No disponible en la información | Hugging Face |
| Política PPO profesora | No es un LLM (red de política) | No aplica | 100 % de acierto; 100 % de éxito | No disponible | Entorno web del proyecto |

## Limitaciones y advertencias

- Ámbito estrictamente acotado: solo responde al formato de pregunta del proyecto (`follow_route`, observación de 27 dimensiones, 5 acciones). Fuera de ese esquema, la salida no es fiable.
- Evaluación con aproximación 2D: el caminado se estima con una tabla de velocidades por comando derivada de MuJoCo web, sin dinámica de contacto ni caídas. Los porcentajes de éxito no equivalen a los de un simulador físico completo.
- Brecha respecto a la profesora: el modelo publicado acierta un 84,5 % de las acciones y completa el 75 % de los episodios, frente al 100 % en ambos de la política original. Un 15 % de episodios terminan en colisión, la misma tasa que la profesora, pero con más fallos por desviación de ruta.
- El SFT supera al RL en acierto (86,4 % frente a 84,5 %) pero rinde peor en la tarea (65 % frente a 75 % de éxito) y colisiona en el 55 % de los episodios; conviene no seleccionar la variante por la métrica de acierto sin comprobar el éxito final.
- El autor advierte explícitamente que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Riesgo de alucinación de letra: si el prompt no se ajusta exactamente al formato esperado, el modelo puede devolver texto libre en lugar de una de las cinco opciones; se recomienda validación y fallback en el bucle de control.
- Idiomas: los metadatos declaran solo coreano, aunque el prompt de sistema está en inglés; no hay evaluación multilingüe publicada.
- Sesgos: no documentados. Al derivar de una política entrenada en un único curso (`random`, `69299c1d`), es probable que generalice mal a geometrías de entorno distintas.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad de validación en un robot real recae en el integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tskim81/connectailab-rl-kimtaesun-avoid-obstacles-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- GitHub del autor: https://github.com/tskim81
