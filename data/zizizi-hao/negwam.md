# Zizizi-hao/NegWAM

## Resumen

NegWAM (Negative-Aware World-Action Model) es un modelo de planificacion de trayectorias para conduccion autonoma end-to-end desarrollado por Zihao Zhang, Xinyu Zhang, Bing Zeng, Xingyu Chen, Zhenning Li, Bin Yu y Ziyuan Pu. Se presenta como un framework de post-entrenamiento orientado a la seguridad sobre modelos unificados world-action, y su contribucion principal es aprender de trayectorias de fallo cercanas al experto (near-expert failure trajectories): alternativas inseguras pero geometricamente proximas a la trayectoria optima. Mediante anclas repulsivas (repulsive anchors) se empuja la prediccion lejos de esas alternativas, y unos tokens de escena (rider tokens) condicionados por la escena aprenden la compatibilidad escena-trayectoria.

El modelo se distribuye como pesos de un transformer 3D basado en Diffusers, con 6.243.520.990 parametros en formato safetensors BF16 (aproximadamente 12,49 GB). La entrada combina observaciones de camara, estado e historial del ego y comandos de navegacion; la salida es un conjunto de 8 poses del ego `(x, y, heading)` que cubren 4 segundos a intervalos de 0,5 segundos, emitidas a traves del agente NAVSIM.

Es relevante ahora porque aborda uno de los cuellos de botella de la conduccion end-to-end: la seguridad en casos limite. En lugar de optimizar solo la imitacion del experto, el post-entrenamiento incorpora senales negativas explicitas. El repositorio incluye resultados de evaluacion en NAVSIM v2 (90,3 EPDMS en navtest y 36,3 en navhard, protocolo de dos etapas), lo que permite reproducir la evaluacion con los CSV publicados y el codigo del repositorio de GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D basado en Diffusers (`WanTransformer3DNavSimModel`, implementacion custom) |
| Parametros totales | 6.243.520.990 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionado por ventana de observaciones de camara y estado del ego; salida de 4 s) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (modelo de conduccion, sin interfaz de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, ~12,49 GB) |

## Arquitectura y entrenamiento

NegWAM se construye sobre un transformer 3D con implementacion propia sobre Diffusers, denominado `WanTransformer3DNavSimModel`. La condicion de entrada combina observaciones de camara, estado e historial del ego y comandos de navegacion, y la salida es una secuencia de 8 poses del ego que abarcan 4 segundos a intervalos de 0,5 segundos, integradas mediante el agente NAVSIM. El modelo se enmarca en la familia de world-action models unificados: un unico backbone procesa la escena y produce la accion de planificacion.

La innovacion central es el esquema de post-entrenamiento negative-aware. Se identifican trayectorias de fallo cercanas al experto (near-expert failures) y se emplean anclas repulsivas para alejar las predicciones de esas alternativas inseguras. Ademas, una rama auxiliar de rider tokens aprende la compatibilidad entre escena y trayectoria; esta rama se usa solo durante el entrenamiento y se omite en la ruta de inferencia, por lo que no anade coste en produccion. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Planificacion de trayectorias del ego end-to-end: genera 8 poses `(x, y, heading)` sobre un horizonte de 4 segundos a 0,5 s por paso.
- Condicionamiento multimodal de entrada: observaciones de camara, estado e historial del ego y comandos de navegacion.
- Razonamiento implicito de seguridad: el post-entrenamiento negative-aware penaliza alternativas cercanas al experto pero inseguras.
- Aprendizaje de compatibilidad escena-trayectoria mediante rider tokens (solo en entrenamiento).
- Integracion con el agente de evaluacion NAVSIM para simulacion cerrada.
- Evaluacion zero-shot en simulacion cerrada HUGSIM, segun el paper.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no disponible (modelo especializado en conduccion).
- Capacidades multilingues: no disponible (no procesa lenguaje natural).

## Casos de uso

- Planificacion de trayectorias en vehiculos autonomos urbanos: el modelo produce poses del ego a 4 segundos con condicionamiento de camara y comandos de navegacion, adecuado para modulos de planificacion que necesitan una salida compacta y temporalmente consistente.
- Evaluacion de seguridad en casos limite: el esquema negative-aware permite analizar como se comporta el planificador ante escenarios con trayectorias de fallo proximas al experto, util para auditoria de seguridad antes de despliegues.
- Investigacion en world-action models: sirve como referencia reproducible para estudiar post-entrenamiento con senales negativas en conduccion end-to-end, con pesos y configuracion publicados.
- Benchmarking en NAVSIM v2: los CSV incluidos (navhard y navtest) permiten comparar nuevos metodos contra los resultados reportados (36,3 y 90,3 EPDMS) bajo el mismo protocolo.
- Simulacion cerrada en HUGSIM: el paper reporta evaluacion zero-shot, lo que permite probar el modelo en un simulador distinto al de entrenamiento para medir generalizacion.
- Desarrollo de sistemas de asistencia a la conduccion: la salida de trayectoria a corto plazo puede integrarse en pipelines de planificacion que requieran predicciones de 4 segundos con estado del ego y comandos de navegacion.
- Reproduccion de experimentos academicos: el repositorio de GitHub incluye implementacion custom y herramientas de evaluacion, lo que facilita replicar los resultados con `config.json` y los pesos safetensors.

## Benchmarks y rendimiento

| Benchmark | Split / protocolo | EPDMS | Archivo de resultados |
|---|---|---:|---|
| NAVSIM v2 | navhard, dos etapas | 36,3 | `negwam_navhard_results.csv` |
| NAVSIM v2 | navtest | 90,3 | `negwam_navtest_results.csv` |

Las puntuaciones se expresan en escala 0-100 y redondeadas a un decimal. Para navhard se usa la fila de resumen `extended_pdm_score_combined`; para navtest, la fila `average_all_frames`. Los resultados se regeneraron con caches de metricas creadas con NumPy 1.26.4 (correccion del 23-11-2026). El paper tambien reporta evaluacion zero-shot en simulacion cerrada HUGSIM, pero los valores no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 12,49 GB; se necesita VRAM adicional para activaciones y el agente NAVSIM. Una estimacion conservadora es de 16-24 GB en BF16, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no disponible de forma explicita; por tamano, GPUs con al menos 24 GB (RTX 4090, A100, H100) son candidatas razonables.
- Cabe en consumer GPU: previsiblemente en RTX 4090 (24 GB) en BF16, sujeto a la memoria de activaciones; no confirmado por el autor.
- Opciones de despliegue: implementacion custom basada en Diffusers y agente NAVSIM del repositorio de GitHub; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NegWAM | 6.243.520.990 | 4 s (8 poses) | NAVSIM v2: 90,3 navtest / 36,3 navhard | Apache 2.0 | Pesos en HF, codigo en GitHub |
| Alternativas de conduccion end-to-end | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de modelos comparables de la misma categoria (conduccion end-to-end en NAVSIM v2) para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo especializado en conduccion autonoma: no es un modelo de lenguaje y no soporta generacion de texto, codigo ni tool calling.
- Dependencia del agente NAVSIM para producir la salida de planificacion; requiere el codigo del repositorio de GitHub y la configuracion correcta de `checkpoint_path`.
- Los resultados publicados corresponden a NAVSIM v2 y a la evaluacion zero-shot en HUGSIM del paper; no se han publicado metricas en otros dominios o ciudades.
- La correccion de resultados del 23-11-2026 indica que las cifras dependen de la version de NumPy (1.26.4) usada para regenerar las caches de metricas; versiones distintas pueden alterar la reproducibilidad.
- No se dispone de informacion sobre sesgos, tasas de alucinacion o fallos especificos del modelo.
- La rama de rider tokens se omite en inferencia; su efecto en produccion depende de que el entrenamiento se haya realizado correctamente, sin que se documenten garantias adicionales.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias explicitas de seguridad para despliegue real en vehiculos.
- El modelo tiene 1 like y 3082 descargas en Hugging Face en la fecha de actualizacion, lo que sugiere una validacion comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Zizizi-hao/NegWAM
- Paper (arXiv): https://arxiv.org/abs/2611.08111
- Codigo y setup: https://github.com/Zizizi-hao/NegWAM
- Archivos del modelo: https://huggingface.co/Zizizi-hao/NegWAM/tree/main
- Detalles de la correccion de evaluacion: https://github.com/Zizizi-hao/NegWAM#update
- Archivos de resultados originales: https://huggingface.co/Zizizi-hao/NegWAM/commit/600a6697670f9f84737f4dbe9462863274b3b033
- Roadmap de publicacion de codigo: https://github.com/Zizizi-hao/NegWAM#-roadmap--code-release
- Licencia: https://github.com/Zizizi-hao/NegWAM/blob/main/LICENSE
