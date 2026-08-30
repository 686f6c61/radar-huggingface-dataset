# YunzeLiu/fastwam-trex62-side-branch-icl

## Resumen

FastWAM T-Rex 62-D — Side-Branch ICL es un checkpoint de investigación experimental para manipulación bimanual robótica, desarrollado por Yunze Liu (doctorando en la Universidad Tsinghua, investigador en NVIDIA Research) dentro del marco FastWAM-ICL. Se trata de un modelo de visión-lenguaje-acción (VLA) que incorpora aprendizaje en contexto (in-context learning, ICL) mediante una rama lateral de cross-attention densa que condiciona cada capa del transformer con tokens de contexto precomputados. El modelo está entrenado sobre el subconjunto `pick_fruits` del dataset `wushr-lance/VLA2Vec` y parte de un checkpoint base FastWAM T-Rex congelado en el paso 27.708.

La relevancia de este modelo radica en su enfoque de ICL para robótica: en lugar de ajustar el backbone completo, solo se optimizan la rama lateral y las puertas de atención, lo que permite adaptar el comportamiento a una tarea concreta mediante una referencia visual fija (un vídeo humano auditado) sin necesidad de reentrenar el modelo base. El checkpoint alcanzó los 5.480 pasos de optimización planificados, pero no se le ha asignado una tasa de éxito en robot físico; se publica como un hito de investigación con un servidor de política compatible con T-Rex listo para ejecución en hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastWAM T-Rex 62-D con rama lateral de cross-attention densa (ICL) |
| Parametros totales | no disponible (checkpoint base de 12.042.403.349 bytes, rama ICL de 317.602.657 bytes) |
| Parametros activos | no disponible (solo se optimizan la rama lateral y las puertas; el backbone esta congelado) |
| Longitud de contexto | 32 tokens de contexto (shape 32 x 1024, dtype float16) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch nativo) |
| Idiomas soportados | no disponible (tarea fija en ingles: "Pick up the fruit on the left side...") |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (checkpoint base y rama ICL), `.safetensors` (VAE y tokens de contexto) |

## Arquitectura y entrenamiento

El modelo se basa en el backbone FastWAM T-Rex, un modelo de vision-lenguaje-accion para manipulacion bimanual con un espacio de accion de 62 dimensiones (31 por brazo, incluyendo delta xyz local, delta rotacion local y otros canales). La variante side-branch ICL congela el backbone original y anade una rama lateral de cross-attention densa en cada capa del transformer. Esta rama se condiciona con Context Tokens precomputados a partir de una referencia visual fija (un video humano auditado, codificado por el modelo RoboRAG-X, que solo se usa como procedencia y no se ejecuta en inferencia). Durante el entrenamiento se aplica un dropout de referencia del 0.10.

El entrenamiento se realizo sobre el subconjunto `pick_fruits` del dataset `wushr-lance/VLA2Vec`, con entrada de tres camaras RGB en un canvas compuesto de 448 x 384 píxeles y un action chunk de 32 pasos. El checkpoint ICL alcanzo los 5.480 pasos de optimizacion, partiendo del mismo checkpoint base congelado en el paso 27.708. No se menciona el uso de RLHF ni DPO; el enfoque es de aprendizaje por imitacion con condicionamiento por contexto.

## Capacidades

- Manipulacion bimanual: genera chunks de accion de 32 pasos en un espacio de 62 dimensiones (31 por brazo), con control local delta xyz y delta rotacion.
- Aprendizaje en contexto: condiciona la politica mediante tokens de contexto precomputados a partir de una referencia visual fija, sin reentrenar el backbone.
- Integracion con T-Rex: servidor ZMQ compatible con el cliente T-Rex, con soporte para reinicio por episodio y auditoria del ciclo de vida de la referencia.
- Ciclo de vida Short-24: la referencia se activa durante los primeros 24 pasos de control y se desactiva despues, con empalme exacto en el bloque de pasos 16-31.
- Entrada multimodal: tres camaras RGB (cabeza, muneca izquierda, muneca derecha) a 640x360, sin recorte.
- Sin soporte de tool calling ni agentes genericos: es un modelo de politica robotica especifico, no un LLM conversacional.

## Casos de uso

- Recogida y colocacion de objetos en robotica: el modelo esta entrenado para la tarea de recoger frutas de ambos lados y colocarlas en una cesta, usando ambas manos de forma coordinada.
- Evaluacion de ICL en robotica: permite estudiar como una rama lateral condicionada por contexto puede adaptar una politica congelada a una tarea concreta sin reentrenamiento completo.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para comparar variantes de ICL (side-branch vs. prefilling) sobre el mismo checkpoint base.
- Despliegue en hardware real con T-Rex: el servidor ZMQ incluido permite conectar el modelo a un robot T-Rex existente, aplicando el parche de cliente Short-24 y reiniciando el episodio antes de cada rollout.
- Reproduccion de experimentos: el repositorio es autocontenido (checkpoint base, rama ICL, VAE, tokens de contexto y estadisticas de normalizacion), lo que facilita la reproducibilidad sin dependencias externas.
- Desarrollo de sistemas de control con referencia visual: el uso de un video humano como referencia fija puede extenderse a otras tareas de manipulacion con un pipeline similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el checkpoint es experimental, que no se le ha asignado una tasa de exito en robot fisico y que los resultados Short-24 deben reportarse por separado de los de referencia persistente.

## Requisitos de hardware

- VRAM estimada: no especificada por el autor. El checkpoint base ocupa ~12 GB en disco y la rama ICL ~318 MB, por lo que se requiere una GPU con al menos 16-24 GB de VRAM para inferencia en precision float32/float16.
- GPU recomendadas: no se indica un modelo concreto, pero el entorno de instalacion usa CUDA 12.8 (torch 2.7.1 con cu128), lo que sugiere GPUs modernas (serie RTX 40, A100, H100).
- Compatibilidad con GPU de consumo: probablemente cabe en una RTX 4090 (24 GB) o similar, pero no esta confirmado.
- Opciones de despliegue: servidor ZMQ propio (`inference/serve_trex62.py`), compatible con el cliente T-Rex. No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre modelos comparables en la misma categoria (VLA con ICL para manipulacion bimanual). El autor publica una variante hermana, `fastwam-trex62-prefilling-icl`, que comparte el mismo checkpoint base y dataset, pero no se proporcionan datos comparativos entre ambas.

## Limitaciones y advertencias

- Checkpoint experimental: no tiene tasa de exito en robot fisico asignada y el autor advierte que el "legacy short-window convergence gate" fallo, lo que indica posibles problemas de convergencia en la ventana corta.
- Ciclo de vida Short-24: la referencia se desactiva tras 24 pasos de control; los resultados deben reportarse por separado de los de referencia persistente. Si no se aplica el reinicio por episodio, el estado del ciclo de vida puede filtrarse entre episodios.
- Dependencia de una referencia fija: la politica depende de un video humano auditado y de tokens de contexto precomputados; cualquier cambio en la referencia requiere regenerar los tokens.
- Sin soporte multilingue: la tarea esta fijada en ingles y no se documentan capacidades en otros idiomas.
- Licencia no disponible: no se especifican restricciones de uso comercial ni de redistribucion.
- Requisitos de integracion: requiere un robot T-Rex compatible y un parche de cliente especifico; no es un modelo autonomo.
- Riesgo de alucinacion: no aplica directamente (no es un LLM generativo), pero la politica puede ejecutar acciones incorrectas si la referencia o los tokens de contexto no son representativos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/YunzeLiu/fastwam-trex62-side-branch-icl
- Variante prefilling: https://huggingface.co/YunzeLiu/fastwam-trex62-prefilling-icl
- Pagina personal del autor: https://yunzeliu.github.io/index.html
- Dataset VLA2Vec: https://huggingface.co/datasets/wushr-lance/VLA2Vec
