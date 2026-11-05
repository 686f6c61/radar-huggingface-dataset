# vladyslavxxxx/genai-lab-01

## Resumen

El repositorio `vladyslavxxxx/genai-lab-01` no contiene un modelo entrenado por su autor, sino un artefacto academico de caracter didactico. Segun la model card, se trata de un "repositorio educativo de artefactos" en el que "no se ha entrenado ningun modelo propio". El contenido documenta la practica numero 1 de la asignatura de generacion de IA, realizada por el alumno Polous Vladyslav (grupo A-56/KN), centrada en el despliegue de un entorno para IA generativa.

El trabajo descrito consiste en la ejecucion de un cuaderno de Google Colab sobre una GPU Tesla T4, con Python 3.13.16, PyTorch 2.11.0+cu130, transformers 4.57.6 y diffusers 0.35.2. Los experimentos combinan un LLM de terceros (Qwen/Qwen2.5-0.5B-Instruct) con distintos parametros de muestreo (temperature/top_p de 0.7/0.9, 1.1/0.9 y 0.7/0.5, semilla 42) y un modelo de difusion (Stable Diffusion v1.5 y SD-Turbo) para generacion de imagenes de 512x512.

Por tanto, el repositorio no aporta pesos, arquitectura ni datos de entrenamiento propios. Su relevancia es exclusivamente documental: registra mediciones de tiempo de inferencia en difusion (9,30 s para naive art a 30 pasos; 8,33 s para cinematic photo a 30 pasos; 3,29 s a 10 pasos; 0,76 s con SD-Turbo a 1 paso) y el estado de avance de la practica, con los experimentos de Colab completados y los de Kaggle y las conclusiones finales aun pendientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se entrena ningun modelo propio; se usan Qwen2.5-0.5B-Instruct y Stable Diffusion v1.5 / SD-Turbo) |
| Parametros totales | no disponible (el LLM utilizado, Qwen2.5-0.5B-Instruct, tiene 0,5 mil millones, pero no es un modelo del repositorio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible como modelo propio; los prompts de prueba fueron en ucraniano e ingles |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamano del repo: 0,0 GB, sin pesos publicados) |

## Arquitectura y entrenamiento

No existe arquitectura ni entrenamiento propio. El repositorio es un artefacto de practica academica que documenta el uso de modelos de terceros: Qwen/Qwen2.5-0.5B-Instruct para generacion de texto y Stable Diffusion v1.5 junto con SD-Turbo para generacion de imagenes. No se especifican tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion como RLHF o DPO, porque el autor no entrena ningun modelo.

La innovacion tecnica documentada se limita al entorno y a la metodologia experimental: ejecucion en Tesla T4 con CUDA, Python 3.13.16, PyTorch 2.11.0+cu130, transformers 4.57.6 y diffusers 0.35.2, con semilla fija (42) y barridos de temperature/top_p para el LLM. En difusion se comparan tiempos de inferencia entre Stable Diffusion v1.5 (30 y 10 pasos) y SD-Turbo (1 paso), con la observacion de que el cambio de modelo en Turbo no permite explicar la diferencia unicamente por el numero de pasos.

## Capacidades

- No se declara ninguna capacidad propia del repositorio, ya que no contiene un modelo entrenado.
- Generacion de texto: realizada mediante Qwen2.5-0.5B-Instruct con prompts en ucraniano e ingles; no es una capacidad del artefacto.
- Generacion de imagenes: realizada mediante Stable Diffusion v1.5 y SD-Turbo a 512x512; no es una capacidad del artefacto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible como modelo propio; los experimentos usan ucraniano e ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Documentacion de practicas academicas: el repositorio sirve como registro reproducible de una practica de despliegue de entornos de IA generativa, con versiones de librerias, hardware y semillas documentadas.
- Referencia de tiempos de inferencia en difusion: los datos de 9,30 s, 8,33 s, 3,29 s y 0,76 s permiten comparar el coste de pasos y el uso de SD-Turbo frente a SD v1.5 en una T4.
- Plantilla de cuaderno Colab: el enlace al notebook con codigo y resultados puede reutilizarse como base para laboratorios similares con transformers y diffusers.
- Estudio de barridos de muestreo: los valores de temperature/top_p (0,7/0,9; 1,1/0,9; 0,7/0,5) con semilla 42 sirven como ejemplo de experimentacion controlada con un LLM pequeno.
- Formacion de estudiantes: el artefacto ilustra el flujo completo de montaje de entorno, ejecucion en GPU y registro de resultados en un contexto docente.
- Evaluacion de infraestructura: las mediciones en Tesla T4 con CUDA y PyTorch 2.11.0+cu130 aportan una referencia practica para dimensionar experimentos de generacion de imagenes.
- Base para extension a Kaggle: el estado "pendiente" de los experimentos de Kaggle indica una hoja de ruta documentada para replicar el trabajo en otra plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos cuantitativos son tiempos de inferencia en difusion sobre Tesla T4, medidos sin contar la carga de modelos:

| Modelo | Prompt | Pasos | Tiempo |
|---|---|---|---|
| Stable Diffusion v1.5 | naive art | 30 | 9,30 s |
| Stable Diffusion v1.5 | cinematic photo | 30 | 8,33 s |
| Stable Diffusion v1.5 | cinematic photo | 10 | 3,29 s |
| SD-Turbo | cinematic photo | 1 | 0,76 s |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para un modelo propio, ya que no se publican pesos.
- GPU utilizada en los experimentos: Tesla T4 con CUDA disponible.
- GPU recomendadas: no disponible; el autor solo documenta la T4.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: Google Colab con Python 3.13.16, PyTorch 2.11.0+cu130, transformers 4.57.6 y diffusers 0.35.2; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se aportan los tiempos de difusion de la tabla anterior; no hay datos de throughput del LLM.

## Comparativa con modelos similares

No disponible. El repositorio no contiene un modelo propio que pueda compararse con alternativas de la misma categoria; los modelos empleados (Qwen2.5-0.5B-Instruct, Stable Diffusion v1.5 y SD-Turbo) son de terceros y no forman parte del artefacto publicado.

## Limitaciones y advertencias

- El repositorio no contiene ningun modelo entrenado; no debe citarse como modelo de IA generativa.
- El tamano del repositorio es de 0,0 GB, sin pesos, tokenizador ni configuracion publicados.
- No se declara licencia, lo que impide determinar condiciones de uso comercial o redistribucion.
- No se especifican idiomas soportados ni pipeline de HuggingFace.
- Los resultados son de un unico entorno (Tesla T4, Colab) y no son extrapolables a otro hardware.
- Los tiempos de difusion excluyen la carga de modelos, por lo que no reflejan la latencia extremo a extremo.
- El trabajo esta incompleto: los experimentos de Kaggle y las conclusiones finales estan pendientes segun la propia model card.
- Riesgo de confusion: el titulo y la estructura pueden llevar a interpretar erroneamente que se trata de un modelo desplegable.
- No hay datos sobre sesgos, alucinacion o comportamiento en produccion porque no se evalua ningun modelo propio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vladyslavxxxx/genai-lab-01
- Cuaderno de Colab con codigo y resultados: https://colab.research.google.com/drive/1BABGqqLRmVIMhmEuydVLpnksuUAfic6P
