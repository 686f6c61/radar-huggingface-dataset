# ttktjmt/cartpole-seed2

## Resumen

`ttktjmt/cartpole-seed2` es una política de aprendizaje por refuerzo entrenada para resolver la tarea de equilibrio de cartpole (cartpole balance) del entorno de simulación robótica mjlab, construido sobre el motor físico MuJoCo. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un artefacto de control entrenado desde cero mediante RL para una tarea concreta de control clásico, empaquetado en el formato del registro Phi Registry junto con la definición de la tarea.

El modelo lo publica el usuario `ttktjmt` y se distribuye a través de la librería `phiregistry`, que permite descargar tanto la tarea como la política asociada mediante el comando `phi pull`. La política se exportó desde la tarea `Mjlab-Cartpole-Balance` y se entrenó durante 100 iteraciones, equivalentes a 819.200 pasos de entorno, partiendo de cero sobre la definición de tarea fijada en el commit `b2a5159b70228134bd95fd68b48831908c0ffa84` del repositorio `ttktjmt/cartpole`.

Su relevancia es acotada y de nicho: sirve como ejemplo reproducible de un pipeline de entrenamiento RL en mjlab y como política de referencia para validar instalaciones del entorno. Con 9.219 parámetros totales y un tamaño de repositorio de 0,0 GB, es un artefacto extremadamente pequeño, adecuado para pruebas rápidas y para experimentar con el ecosistema Phi Registry, no para aplicaciones de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL para control; no se especifica la topología de red en la información disponible) |
| Parametros totales | 9.219 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red neuronal de la política (número de capas, anchura, tipo de observaciones o espacio de acciones). Lo que sí se documenta es el proceso de entrenamiento: 100 iteraciones de un algoritmo de RL no especificado, con un total de 819.200 pasos de entorno, entrenado desde cero sobre la tarea definida en el commit `b2a5159b70228134bd95fd68b48831908c0ffa84` del repositorio `ttktjmt/cartpole`. El entorno es la tarea integrada `Mjlab-Cartpole-Balance` de mjlab, que simula el clásico problema de equilibrar un péndulo invertido sobre un carro mediante el motor físico MuJoCo.

No se dispone de información sobre la composición del dataset (en RL, la distribución de estados se genera por interacción con el simulador), sobre técnicas de regularización, currículo, recompensas o ajuste fino posterior. Tampoco se documentan innovaciones técnicas destacables como decodificación especulativa o atención lineal, que no aplican a este tipo de artefacto.

## Capacidades

- Control de política para la tarea de equilibrio de cartpole en el simulador mjlab (MuJoCo).
- Ejecución como política entrenada asociada a una tarea concreta del registro Phi Registry.
- Reproducibilidad del pipeline de entrenamiento mediante el comando `phi pull` y la referencia al commit de linaje.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No dispone de modo de pensamiento (thinking mode), audio ni otras modalidades.

## Casos de uso

- Validación de instalaciones de mjlab: cargar la política con `phi pull ttktjmt/cartpole-seed2` y ejecutarla en la tarea `Mjlab-Cartpole-Balance` para comprobar que el simulador, las dependencias y el registro funcionan correctamente.
- Pruebas de regresión de entornos RL: usar la política como referencia de comportamiento esperado tras cambios en la definición de la tarea o en la versión del motor físico.
- Docencia y tutoriales de RL: ejemplo mínimo y reproducible (9.219 parámetros, 819.200 pasos de entorno) para ilustrar el ciclo completo de entrenamiento, exportación y despliegue de una política en mjlab.
- Benchmarking de infraestructura de simulación: medir latencia de paso del simulador y throughput de episodios con una política de coste computacional despreciable.
- Comparación de semillas y linajes: al existir variantes como `cartpole-seed2`, permite estudiar la variabilidad entre ejecuciones de entrenamiento partiendo del mismo commit base.
- Integración en pipelines de CI para robótica simulada: verificar de forma automática que una política entrenada se carga y actúa sin errores tras actualizaciones del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: insignificante; con 9.219 parámetros, el modelo ocupa del orden de decenas de kilobytes en precisión estándar.
- GPU recomendadas: no es necesaria GPU; cualquier CPU moderna puede ejecutar la inferencia de la política. Una GPU consumer (por ejemplo, RTX 4090) solo aportaría ventaja en la simulación física, no en la política.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: el flujo documentado es `pip install phiregistry` seguido de `phi pull <repo id>`; el formato de pesos es safetensors. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ttktjmt/cartpole-seed2 | Política RL (cartpole, mjlab) | 9.219 | no aplica | no disponible | Hugging Face (Phi Registry) |
| ttktjmt/cartpole | Tarea y política base (mjlab) | no disponible | no aplica | no disponible | Hugging Face (Phi Registry) |
| Otras políticas de cartpole en mjlab | Políticas RL para la misma tarea | no disponible | no aplica | no disponible | no disponible |

La comparación con modelos de lenguaje u otros modelos fundacionales no es pertinente: se trata de un artefacto de control específico de tarea. La alternativa más directa documentada es el repositorio base `ttktjmt/cartpole`, del que este modelo deriva por linaje.

## Limitaciones y advertencias

- Modelo específico de tarea: solo es válido para el equilibrio de cartpole en mjlab; no generaliza a otras tareas ni entornos.
- Sin licencia declarada: la ausencia de licencia impide asumir permisos de uso comercial; es necesario contactar con el autor antes de cualquier uso en producción.
- Entrenamiento corto: 100 iteraciones y 819.200 pasos de entorno pueden ser insuficientes para una política robusta; no se documenta la recompensa final ni la tasa de éxito.
- Sin información sobre la arquitectura de la red ni sobre el algoritmo de RL empleado, lo que dificulta la auditoría técnica.
- Sin datos de benchmarks ni de robustez frente a perturbaciones, cambios de parámetros físicos o ruido en observaciones.
- Sin documentación de sesgos, alucinación o limitaciones de idioma, que no aplican a este tipo de artefacto, pero tampoco se documentan riesgos de simulación (sim-to-real gap) si se pretendiera transferir a hardware físico.
- Popularidad nula en el momento de la ficha (0 descargas, 0 likes): no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ttktjmt/cartpole-seed2
- Repositorio base de linaje: https://huggingface.co/ttktjmt/cartpole
- mjlab (repositorio del proyecto): https://github.com/mujocolab/mjlab
- Librería phiregistry: se instala con `pip install phiregistry` (no se ha proporcionado URL adicional)
