# thatboymentor/SEEDRAAI-UNPOSED-Candid-Photography-Krea2

## Resumen

SEEDRAAI UNPOSED es un LoRA de ajuste fino para el modelo de generacion de imagenes Krea 2 Turbo, orientado a producir fotografia de estilo candid, espontaneo y con aspecto de instantanea cotidiana. Lo publica el usuario thatboymentor bajo la marca SEEDRAAI, y su funcion es inyectar en el modelo base un sesgo estetico hacia rostros expresivos, poses relajadas y encuadres propios de fotografia de movil, selfies frente al espejo, retratos de interior, escenas nocturnas urbanas, playa y flash directo.

Tecnicamente es un adaptador de bajo rango (LoRA) sobre Krea 2 Turbo, no un modelo completo: el repositorio ocupa 0,2 GB y no incluye pesos del modelo base, por lo que requiere descargar y ejecutar Krea 2 Turbo por separado. El pipeline declarado es text-to-image y el adaptador no define palabra de activacion (trigger word), de modo que el estilo se invoca mediante la descripcion del escenario, el encuadre, la iluminacion y la expresion en el prompt.

Su relevancia practica es acotada pero concreta: permite obtener un look fotografico no posado sin reentrenar el modelo base, con ajustes de inferencia documentados por el autor (8 pasos, CFG 1.0, sampler euler_ancestral, scheduler beta57, shift 6.0). No se dispone de informacion sobre licencia, idiomas ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Krea 2 Turbo, modelo de difusion text-to-image |
| Parametros totales | no disponible (adaptador LoRA; el repositorio ocupa 0,2 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusion text-to-image) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts del autor estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 0,2 GB con imagenes de ejemplo y GALLERY PROMPTS.md) |

## Arquitectura y entrenamiento

El modelo es un LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas del transformer de difusion de Krea 2 Turbo para modificar su distribucion de salida sin alterar los pesos originales. El modelo base es Krea 2 Turbo, un text-to-image de la organizacion krea, y el adaptador se carga junto a el en el pipeline de inferencia. No se ha publicado informacion sobre el numero de pasos de entrenamiento, el dataset utilizado, la composicion de las imagenes de entrenamiento ni si se aplicaron tecnicas de regularizacion o captions especificos.

La unica informacion tecnica disponible sobre el proceso es la relativa a la inferencia: el autor recomienda fuerza de LoRA 1.0 como punto de partida, sin palabra de activacion, y documenta que las imagenes de la galeria se generaron con 8 pasos, CFG 1.0, sampler euler_ancestral, scheduler beta57, shift 6.0 y resolucion 896 x 1184, con fuerza de LoRA y de CLIP de 1.0. Los ejemplos se presentan como salidas directas del modelo, sin postprocesado de aspecto de camara.

## Capacidades

- Generacion de texto a imagen con estetica de fotografia candid: rostros expresivos, poses no posadas y encuadres improvisados.
- Estilo de instantanea de movil: selfies frente al espejo, retratos de interior, escenas nocturnas urbanas, fotos de playa y flash directo.
- Control del resultado mediante prompt descriptivo de escenario, encuadre, iluminacion y expresion, sin necesidad de trigger word.
- Compatibilidad con el ecosistema de Krea 2 Turbo y sus herramientas de inferencia (samplers, schedulers y escalas de CFG documentadas por el autor).
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo puramente generativo de imagen.
- No dispone de capacidades de vision, audio, thinking mode ni procesamiento de lenguaje natural mas alla de la codificacion de prompts.
- Capacidades multilingues: no disponibles; los prompts de ejemplo estan en ingles.

## Casos de uso

- Retratos para redes sociales: el LoRA genera imagenes con aspecto de foto espontanea de movil, adecuadas para contenido de estilo lifestyle sin contratar sesion fotografica.
- Selfies frente al espejo para marcas de moda o accesorios: permite describir el encuadre y la iluminacion para obtener composiciones creibles de probador o dormitorio.
- Fotografia nocturna urbana de ambiente: util para ilustrar escenas de calle con flash directo y expresiones naturales en entornos de ciudad.
- Contenido de playa y viajes: genera instantaneas de vacaciones con luz natural y poses relajadas, apropiadas para blogs de viaje o campañas de turismo.
- Pruebas de concepto para direccion de arte: permite explorar rapido variaciones de encuadre, iluminacion y expresion antes de una produccion fotografica real.
- Ilustracion de escenas cotidianas en publicaciones editoriales: el estilo no posado encaja en articulos sobre vida diaria, cultura juvenil o tendencias sociales.
- Generacion de imagenes de referencia para storyboards: sirve para comunicar al equipo de produccion el tono visual de una escena candid antes de rodarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Krea 2 Turbo y de la precision de carga, no del adaptador (0,2 GB).
- GPU recomendadas: no disponibles; se desconoce el perfil de memoria de Krea 2 Turbo a partir de los datos facilitados.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponibles; el autor no documenta backends concretos (vLLM, llama.cpp, Ollama, TGI, ComfyUI, Diffusers) en la model card.
- Latencia y throughput: no disponibles; el autor solo indica 8 pasos de muestreo con euler_ancestral y CFG 1.0, lo que sugiere una generacion rapida, pero sin cifras de tiempo.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SEEDRAAI UNPOSED (este) | LoRA de fotografia candid | Krea 2 Turbo | no aplica | no disponible | Hugging Face, Civitai |
| Krea 2 Turbo (modelo base) | Text-to-image completo | no aplica | no aplica | no disponible | Hugging Face |
| Otros LoRA de retrato para Krea 2 | LoRA de retrato | Krea 2 Turbo | no aplica | no disponible | no disponible en la informacion |

No se dispone de datos de rendimiento ni de especificaciones de alternativas comparables en la informacion proporcionada, por lo que la comparacion se limita al tipo de artefacto y al modelo base.

## Limitaciones y advertencias

- No se ha publicado la licencia del adaptador, lo que impide confirmar si se permite uso comercial; es imprescindible verificar la licencia del modelo base Krea 2 Turbo antes de desplegarlo en produccion.
- El adaptador no funciona de forma autonoma: requiere descargar y ejecutar Krea 2 Turbo, cuyos requisitos de hardware y licencia son independientes.
- Riesgo de sesgos: al estar entrenado para un estilo fotografico concreto, puede reproducir sesgos de representacion (edad, etnia, genero, tipo de cuerpo) presentes en sus datos de entrenamiento, no documentados.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta (manos, dedos, ojos), texto ilegible en la imagen y artefactos en fondos complejos.
- El estilo se controla mediante prompt en ingles; no hay evidencia de soporte para prompts en castellano ni de capacidades multilingues.
- La fuerza de LoRA 1.0 es solo un punto de partida recomendado; valores altos pueden producir sobreajuste estetico y perdida de diversidad en las poses.
- El repositorio no incluye metadatos de imagen en los ejemplos y el autor indica que las salidas son directas, sin postprocesado, lo que limita la comparabilidad con otros flujos.
- Sin descargas ni likes en el momento de la consulta: no hay validacion comunitaria ni informes independientes de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/thatboymentor/SEEDRAAI-UNPOSED-Candid-Photography-Krea2
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Civitai: https://civitai.com/models/3059356/seedraai-unposed-candid-photography-for-krea-2-turbo?modelVersionId=3481276
- Discord de SEEDRAAI: https://discord.gg/dzZMr7ZeXV
- Sitio web de SEEDRAAI: https://seedraai.com/
- Prompts de la galeria: https://huggingface.co/thatboymentor/SEEDRAAI-UNPOSED-Candid-Photography-Krea2/blob/main/GALLERY%20PROMPTS.md
