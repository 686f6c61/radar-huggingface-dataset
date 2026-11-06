# spoindo/connectailab-rl-spoindo-goto-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, entrenado por el autor spoindo (CONNECT AI LAB × AI CITY BUILDERS) para una tarea muy concreta: la toma de decisiones de un robot simulado llamado LINK-01 en la tarea `goto_target` (ir a un objetivo). El modelo recibe una descripción textual del estado del robot (distancia y dirección al objetivo, sensores de distancia, velocidad y la acción anterior) y devuelve una única letra que corresponde a una de cinco acciones de locomoción para los próximos 0,5 segundos.

La relevancia de este modelo no reside en sus capacidades generales de lenguaje, sino en el enfoque metodológico: se entrena una política de refuerzo (PPO) en un simulador web, se destila esa política en un modelo de lenguaje mediante aprendizaje supervisado (LoRA) y posteriormente se refina con RL (con restricción KL). El resultado es un modelo de 0,8 mil millones de parámetros que actúa como cabeza de decisión de bajo coste, con un 75,9 % de coincidencia con la política maestra y un 65 % de éxito en 20 episodios de evaluación.

Es un modelo de investigación y educativo, con licencia Apache 2.0, pensado para experimentar con la intersección entre modelos de lenguaje y políticas de control en robótica simulada, no para uso en robótica real sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B; no se documenta en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio contiene únicamente pesos safetensors del adaptador) |
| Idiomas soportados | ko (coreano), según la model card; las instrucciones de sistema están en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA cargable con PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) montado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se entrena con la librería PEFT y se distribuye como pesos safetensors; el repositorio ocupa 0,0 GB, lo que confirma que solo contiene el adaptador y no el modelo base completo.

El proceso de entrenamiento tiene cuatro fases documentadas por el autor: (1) se entrena una política PPO en un simulador web (tarea `goto_target`, curso `random`, convención `link01-decision/goto_target/obs10-act5/walker51-14/v1`) hasta alcanzar un 100 % de éxito en el examen oficial; (2) se genera un conjunto de problemas convirtiendo cada 0,5 s las observaciones del robot en texto, con la respuesta de la política como etiqueta, incluyendo un 20 % de ejemplos con desviaciones; (3) aprendizaje supervisado del modelo de lenguaje sobre esas etiquetas (LoRA); (4) refinamiento con RL, usando como recompensa el retorno obtenido si la política maestra continuase desde la acción elegida, con una restricción KL para no alejarse demasiado del modelo supervisado. Los conjuntos de datos tienen 473 ejemplos de entrenamiento, 90 de validación y 137 de test. La evaluación final se realiza colocando el modelo en el puesto de decisión del robot y ejecutando 20 episodios con semillas 91001–91020.

## Capacidades

- Clasificación de acciones discretas: dado un estado textual del robot, devuelve una sola letra entre cinco opciones de locomoción (`obs10-act5`).
- Razonamiento de decisión a corto plazo: la predicción cubre los próximos 0,5 segundos de marcha.
- Seguimiento de instrucciones de formato estricto: el prompt de sistema exige devolver únicamente la letra de la opción, sin explicación.
- Robustez ante estados fuera de distribución: el conjunto de entrenamiento incluye un 20 % de ejemplos con desviaciones respecto a la política maestra.
- Capacidad multilingüe limitada: la model card declara coreano como idioma; las instrucciones de sistema están en inglés.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Cabeza de decisión en robótica simulada: sustituir la política PPO original por el modelo de lenguaje en el bucle de control del robot LINK-01 en el simulador, manteniendo el resto del pipeline intacto.
- Destilación de políticas en modelos de lenguaje: usar este adaptador como referencia para replicar el flujo PPO → supervisado → RL en otras tareas de control discreto.
- Experimentación educativa con RL y LLM: servir como ejemplo práctico en cursos de reinforcement learning y modelos de lenguaje, tal como propone el autor en AI CITY BUILDERS.
- Evaluación de robustez ante estados ruidosos: aprovechar los ejemplos con desviaciones del 20 % para probar la tolerancia del modelo a observaciones imperfectas.
- Prototipado rápido de agentes de decisión de bajo coste: con 0,8 mil millones de parámetros, el adaptador puede ejecutarse en hardware modesto para pruebas de concepto.
- Análisis de la brecha entre política maestra y destilación: comparar el 75,9 % de coincidencia con la política original para estudiar pérdidas de rendimiento en la destilación.

## Benchmarks y rendimiento

Los datos publicados por el autor en la model card son los siguientes:

| Modelo | Acierto en test (coincidencia con la política maestra) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Política maestra (PPO) | 100,0 % | 100 % | 0 % | 10,4 s |
| Modelo sin entrenar | 27,0 % | 0 % | 0 % | — |
| Aprendizaje supervisado | 75,9 % | 65 % | 0 % | 12,8 s |
| Aprendizaje por refuerzo (este modelo) | 75,9 % | 65 % | 0 % | 11,9 s |

El autor indica que la evaluación de marcha se realizó con una aproximación 2D basada en una tabla de velocidades por comando, sin el modelo del robot ni la red neuronal de marcha, por lo que los resultados pueden diferir ligeramente de los del simulador MuJoCo web. El techo de acierto (coincidencia máxima alcanzable al trasladar las observaciones a texto) se estima en un 99 %.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 0,8 mil millones de parámetros, la inferencia en fp16 requiere aproximadamente 1,6 GB para los pesos, más el adaptador LoRA y las activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería poder ejecutar el modelo base en fp16; no se documentan recomendaciones del autor.
- GPU de consumo: el modelo cabe con holgura en tarjetas como RTX 3060, RTX 4060 o superiores; también en GPUs integradas con suficiente memoria compartida, aunque no se han publicado mediciones.
- Opciones de despliegue: transformers + PEFT (el método documentado en la model card); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación más directa es con la propia política maestra PPO y con el modelo base sin adaptador, cuyos resultados se recogen en la tabla de benchmarks. Frente a la política maestra, el adaptador pierde 24,1 puntos de coincidencia y 35 puntos de éxito en episodios, pero gana en tiempo medio de episodio exitoso (11,9 s frente a 10,4 s, es decir, es más lento).

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea `goto_target` con 5 acciones discretas; no generaliza a otras tareas de control sin reentrenamiento.
- El rendimiento en simulación no garantiza el comportamiento en un robot real: el propio autor recomienda validar de nuevo en el robot y el espacio concretos antes de usarlo.
- La evaluación de marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo, por lo que los resultados pueden no coincidir con el entorno real.
- El modelo declara únicamente coreano como idioma; el prompt de sistema está en inglés y el formato de salida es una sola letra, lo que limita su uso como modelo de lenguaje general.
- Riesgo de alucinación: al ser un modelo pequeño destilado, puede devolver letras no válidas o incoherentes ante estados muy alejados de la distribución de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene sus propias condiciones que deben respetarse.
- El repositorio solo contiene el adaptador LoRA (0,0 GB); es necesario descargar el modelo base por separado.
- No se documentan sesgos específicos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spoindo/connectailab-rl-spoindo-goto-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
