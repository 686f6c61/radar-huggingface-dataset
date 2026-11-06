# tc-huang-mahjong/pi05_mahjong_v1_stand_rack07_twos_ovphysx_detour_vary_off5_split_full

## Resumen

`pi05_mahjong_v1_stand_rack07_twos_ovphysx_detour_vary_off5_split_full` es un ajuste fino del modelo de robotica `lerobot/pi05_base` (pi0.5), desarrollado por el usuario `tc-huang-mahjong`. No es un modelo de lenguaje generalista, sino una politica visuomotora entrenada para una tarea concreta de manipulacion de fichas de mahjong en un entorno simulado con Isaac Lab y un brazo robotico SO-101. El modelo resuelve el problema de generar acciones de control (posiciones articulares y pinza) a partir de observaciones visuales y del estado del robot.

El modelo hereda la arquitectura de pi0.5, construida sobre PaliGemma, con aproximadamente 4.143 millones de parametros y pesos en float32 (con autocast bf16 durante el entrenamiento). El repositorio ocupa 99,5 GB e incluye checkpoints por paso, lo que explica el gran tamano frente al numero de parametros.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de ajuste fino de LeRobot para una tarea de robotica de mesa, con configuracion de entrenamiento documentada (30.000 pasos, batch de 12, congelacion parcial del codificador visual). No esta pensado para uso general ni para produccion fuera de su dominio de simulacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (vision-language-action) sobre PaliGemma |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no aplica (politica robotica; sin soporte linguistico declarado) |
| Licencia | Gemma Terms of Use (incluye Gemma Prohibited Use Policy) |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` (revision `main`), una politica visuomotora pi0.5 que combina un backbone de vision-lenguaje PaliGemma con un cabezal de acciones. El ajuste fino se realizo con LeRobot en el commit 38b975c5, usando el dataset `tc-huang-mahjong/mahjong_v1_stand_rack07_twos_ovphysx_detour_vary_off5`, generado en simulacion con Isaac Lab sobre un SO-101. Los pesos y el estado del optimizador se guardan en float32 con autocast bf16.

La configuracion de entrenamiento esta documentada: 30.000 pasos, batch de 12, `freeze_vision_encoder=false`, `gradient_checkpointing=false`, `compile_model=true` con `compile_mode=default`, `scheduler_decay_steps=30000`, precision mixta bf16 y optimizador fusionado. El preprocesador no recorta las camaras y expone `observation.images.front_cam` como dos vistas solapadas (`front_cam` y `front_cam_right`) de 224 x 224, mediante recortes cuadrados definidos en `src/models/split_camera.py`. La rama `main` contiene el ultimo checkpoint y las ramas `step-<step>` cada guardado intermedio (cada 5.000 pasos).

## Capacidades

- Generacion de acciones de control para un brazo SO-101 en tareas de manipulacion de fichas de mahjong.
- Percepcion visual a partir de dos vistas de camara frontales de 224 x 224.
- Condicionamiento por estado del robot y por instruccion de tarea (herencia de pi0.5).
- Ejecucion de politicas de imitacion entrenadas sobre demostraciones simuladas.
- No soporta tool calling, agentes multi-paso ni razonamiento simbolico.
- No dispone de capacidades multilingues ni de generacion de texto libre.
- No incluye modo thinking, vision general, audio ni otras capacidades multimodales fuera del pipeline VLA.

## Casos de uso

- Investigacion en aprendizaje por imitacion: reproducir el pipeline completo de ajuste fino de pi0.5 con LeRobot sobre un dataset propio, usando la configuracion documentada como referencia.
- Benchmark de politicas VLA en simulacion: comparar el rendimiento de pi0.5 frente a otras politicas sobre la misma tarea de mahjong en Isaac Lab.
- Generacion de datos sinteticos: emplear el modelo como politica de referencia para generar trayectorias adicionales en el simulador.
- Validacion de pipelines de robotica de mesa: probar la integracion de camaras divididas (`front_cam` y `front_cam_right`) y el preprocesado sin recorte.
- Docencia y divulgacion: ilustrar el flujo completo desde un modelo base hasta un checkpoint especializado en una tarea concreta.
- Estudio de robustez ante variaciones: el nombre del dataset sugiere variaciones de posicion (`detour`, `vary`, `off5`), util para analizar generalizacion dentro del simulador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4.143 millones de parametros en float32, los pesos ocupan aproximadamente 16,6 GB, por lo que se requiere al menos una GPU de 24 GB para cargar el modelo sin cuantizar.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, encajan A100, H100 o RTX 4090.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) en float32 justo al limite; no confirmado por el autor.
- Opciones de despliegue: LeRobot (libreria declarada); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_mahjong_v1_stand_rack07_twos_ovphysx_detour_vary_off5_split_full | 4.143 M | no disponible | Manipulacion de mahjong (SO-101, Isaac Lab) | Gemma Terms of Use | Hugging Face, 34 descargas |
| lerobot/pi05_base | no disponible | no disponible | Politica VLA generalista | Gemma Terms of Use | Hugging Face |
| tc-huang/pi05_mahjong_v1_standrack07_twos | no disponible | no disponible | Variante de la misma tarea | no disponible | Hugging Face |
| tc-huang-mahjong/pi05_mahjong_v1_stand07_twos_ovphysx_detour_vary_off5_split_full | no disponible | no disponible | Variante de la misma tarea | Gemma Terms of Use | Hugging Face |

## Limitaciones y advertencias

- Modelo especializado en una unica tarea de simulacion; no generaliza a otros entornos ni a robotica real sin reentrenamiento.
- No es un modelo de lenguaje: no responde a prompts textuales ni genera texto.
- Riesgo de sobreajuste al dataset de entrenamiento y a las condiciones del simulador Isaac Lab.
- La licencia Gemma Terms of Use impone restricciones, incluida la Gemma Prohibited Use Policy, y obliga a revisar condiciones para uso comercial.
- Los pesos son modificaciones del modelo base mediante ajuste fino; se deben mantener los avisos de licencia originales.
- El gran tamano del repositorio (99,5 GB) complica la descarga y el almacenamiento.
- No se documentan sesgos, evaluaciones de robustez ni metricas de exito de la tarea.
- Las imagenes de fichas de mahjong derivan de `Mahjong_eg_TW.jpg` de Cangjie6 (CC BY-SA 4.0), lo que anade obligaciones de atribucion si se redistribuyen los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tc-huang-mahjong/pi05_mahjong_v1_stand_rack07_twos_ovphysx_detour_vary_off5_split_full
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Variante relacionada: https://huggingface.co/tc-huang/pi05_mahjong_v1_standrack07_twos
- Variante relacionada: https://huggingface.co/tc-huang-mahjong/pi05_mahjong_v1_stand07_twos_ovphysx_detour_vary_off5_split_full
- Codigo de entrenamiento: https://github.com/tc-huang/mahjong-lab/tree/b034ac7835a6a37cbe6b7dd980c1b139f1e2972c
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Imagen de fichas de mahjong (CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Mahjong_eg_TW.jpg
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
