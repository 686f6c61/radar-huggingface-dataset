# wangmingxinthu/SwitchWorld

## Resumen

SwitchWorld es un conjunto de adaptadores LoRA de rango 128 que añade cambio de perspectiva en-stream entre primera persona (FP) y tercera persona (TP) al modelo base LingBot-World, un generador de video image-to-video. Desarrollado por wangmingxinthu, este proyecto de investigación permite que un mismo video generado alterne dinámicamente el punto de vista sin necesidad de regenerar la secuencia completa. El repositorio contiene la secuencia completa de adaptadores FullFlow v2 para las ramas de alta y baja ruido del proceso de difusión, junto con los checkpoints intermedios para reproducibilidad.

La relevancia de SwitchWorld radica en abordar un problema poco explorado en la generación de video: el control explícito del punto de vista durante la generación, en lugar de limitarse a una cámara fija. Al ser adaptadores sobre un modelo base existente, no requiere entrenar un modelo completo desde cero, lo que reduce costes computacionales. El modelo está pensado para la comunidad de investigación en world models y generación de video, y se distribuye bajo licencia Apache-2.0, aunque el modelo base y los datasets conservan sus propias licencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rango 128) sobre LingBot-World (base: robbyant/lingbot-world-base-cam) |
| Parametros totales | no disponible (los adaptadores se distribuyen como archivos .pt, sin desglose de parametros) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (aplica a video, no a texto) |
| Tipos de cuantizacion | no disponible (los adaptadores son en precision completa, sin cuantizacion publicada) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

SwitchWorld se compone de seis adaptadores LoRA de rango 128, organizados en dos ramas independientes correspondientes a los niveles de ruido alto y bajo del proceso de difusion. Cada rama se entrena en tres etapas secuenciales: primero se entrena un experto en perspectiva primera persona (FP), luego un experto en tercera persona (TP) partiendo del checkpoint anterior, y finalmente un modulo de transicion que aprende a alternar entre ambas perspectivas mientras los pesos compartidos, FP y TP permanecen congelados. Los checkpoints intermedios se incluyen para permitir ablaciones y reproducibilidad.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o ejemplos utilizados, ni sobre el uso de tecnicas como RLHF o DPO. El entrenamiento se realizo sobre el modelo base LingBot-World, que a su vez hereda la arquitectura de Wan2.2, pero los detalles especificos de esa arquitectura no se documentan en la model card de SwitchWorld.

## Capacidades

- Cambio de perspectiva en-stream entre primera persona (FP) y tercera persona (TP) durante la generacion de video.
- Generacion de video a partir de imagen (image-to-video) mediante el modelo base LingBot-World.
- Soporte de dos ramas de ruido (alto y bajo) para adaptarse a diferentes fases del proceso de difusion.
- Los adaptadores son compatibles con el codigo de investigacion SwitchWorld, no con pipelines estandar de Diffusers.
- No se documentan capacidades adicionales como tool calling, agentes o razonamiento multimodal.

## Casos de uso

- Investigacion en world models: permite estudiar como los modelos generativos representan y alternan puntos de vista dentro de una misma escena, util para validar hipotesis sobre consistencia espacial y temporal.
- Simulacion de entornos interactivos: en prototipos de videojuegos o simuladores, se puede generar una secuencia que cambie de perspectiva sin interrumpir la continuidad visual, por ejemplo para mostrar una accion desde el punto de vista del personaje y luego desde una camara externa.
- Narrativa visual adaptativa: en produccion de video experimental, se puede crear contenido donde la camara cambia dinamicamente segun la intencion narrativa, sin necesidad de multiples tomas.
- Generacion de datos sinteticos para entrenamiento de modelos de vision: videos con cambio de perspectiva pueden servir como aumentacion de datos para tareas de seguimiento de objetos o estimacion de pose.
- Evaluacion de tecnicas de adaptacion LoRA en generacion de video: el repositorio incluye checkpoints intermedios que permiten analizar el efecto de cada etapa de entrenamiento, util para investigadores que trabajan en metodos de fine-tuning eficiente.
- Reproduccion de experimentos y ablaciones: al estar publicados los seis adaptadores, se pueden replicar los resultados y comparar el rendimiento de las ramas de alto y bajo ruido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explicitamente que la galeria de resultados incluye salidas de multiples etapas de investigacion, incluyendo lineas base y casos fallidos, y no debe interpretarse como un benchmark curado de calidad. Ademas, se indica que varias interfaces de metricas de evaluacion en el codigo tienen backends mock marcados, por lo que los valores generados por esas metricas no deben tratarse como afirmaciones reales del modelo.

## Requisitos de hardware

- No se proporcionan requisitos especificos de VRAM ni GPU en la model card.
- Al ser adaptadores sobre LingBot-World, que a su vez se basa en Wan2.2, se heredan los requisitos de hardware de ese modelo base, que tipicamente requieren GPUs de alta gama (por ejemplo, A100 o H100) para generacion de video de calidad.
- Los adaptadores en si son ligeros (archivos .pt de rango 128), pero la inferencia completa necesita cargar el modelo base completo, cuyo tamano no se detalla en esta ficha.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que el modelo no es un LLM sino un generador de video.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (cambio de perspectiva en generacion de video). El campo de world models con control de punto de vista es emergente y no se han identificado alternativas publicas con caracteristicas equivalentes en la informacion disponible.

## Limitaciones y advertencias

- Los adaptadores no constituyen un pipeline standalone de Diffusers; requieren el codigo de investigacion SwitchWorld y el modelo base LingBot-World para funcionar.
- La generacion hereda las limitaciones y requisitos de hardware de LingBot-World y Wan2.2, que no se detallan en esta ficha.
- La galeria de resultados incluye salidas de multiples etapas de investigacion, incluyendo lineas base y casos fallidos; no debe interpretarse como una demostracion curada de calidad.
- Varias interfaces de metricas de evaluacion en el codigo tienen backends mock marcados; los valores generados por esas metricas no deben tratarse como afirmaciones reales del modelo.
- La licencia Apache-2.0 se aplica a los adaptadores, pero el modelo base y los datasets utilizados estan sujetos a sus propias licencias y terminos, que deben verificarse antes de un uso comercial.
- No se documentan sesgos especificos, pero al ser un modelo de generacion de video entrenado sobre datos no especificados, podria reflejar sesgos presentes en los datos de entrenamiento del modelo base.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/wangmingxinthu/SwitchWorld
- Modelo base: https://huggingface.co/robbyant/lingbot-world-base-cam
- Codigo: https://github.com/yizhiqianbi/SwitchWorld
- Galeria de resultados: https://yizhiqianbi.github.io/SwitchWorld-Gallery/archive/
