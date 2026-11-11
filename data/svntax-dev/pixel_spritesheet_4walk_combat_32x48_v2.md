# svntax-dev/pixel_spritesheet_4walk_combat_32x48_v2

## Resumen

`pixel_spritesheet_4walk_combat_32x48_v2` es un LoRA de difusion para generacion de imagenes desarrollado por `svntax-dev`, disenado especificamente para producir hojas de sprites (spritesheets) en pixel art de personajes de 32x48 pixeles con animaciones de caminata en cuatro direcciones, dos frames de ataque y un frame de dano. Se entrena sobre el modelo base `Boogu/Boogu-Image-0.1-Edit`, un modelo de edicion de imagen de la familia Boogu Image 0.1.

El modelo resuelve un problema muy concreto en el flujo de trabajo de desarrollo de videojuegos indie: la generacion automatica y consistente de conjuntos de animacion de personajes en formato pixel art con una cuadricula fija de 6x4 frames. La salida esta pensada para integrarse en motores 2D tras un reescalado de 4x (de 768x768 a 192x192) usando herramientas como PixelOE.

Es relevante por su especializacion: en lugar de ser un modelo generativo generalista, es un adaptador de bajo rango que impone una estructura de animacion concreta (caminar abajo/izquierda/derecha/arriba, ataque y dano) y un estilo visual pixel art coherente, lo que reduce drasticamente el trabajo manual de animacion en prototipos de videojuegos. El repositorio ocupa 0,3 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion Boogu Image 0.1 Edit |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no reporta cifra en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible para el LoRA; el modelo base se usa en formato int8 (`boogu_image_edit_turbo_hotfix_1k_20260708_int8_convrot.safetensors`) |
| Idiomas soportados | no disponibles (prompts en ingles en los ejemplos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato diffusers; el modelo base se distribuye como safetensors int8) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre `Boogu/Boogu-Image-0.1-Edit`, un modelo de difusion para edicion y generacion de imagenes. El LoRA impone un sesgo fuerte hacia un formato de salida concreto: una cuadricula de 6 columnas por 4 filas (24 frames) que representa, por fila, las cuatro orientaciones del personaje (abajo, izquierda, derecha y arriba en vista trasera). Cada fila contiene 3 frames de caminata, 2 frames de ataque con balanceo de brazo y 1 frame de dano.

El entrenamiento se realizo con imagenes de 768x768, que es el tamano nativo de las spritesheets usadas como referencia. No se especifica en la informacion disponible el numero de pasos, el dataset exacto, la resolucion de entrenamiento interna ni si se aplicaron tecnicas de regularizacion. El autor indica que el modelo base mantiene sus debilidades originales (deriva de identidad del personaje, cambios de pose complejos) y que el LoRA puede usarse tambien como modelo de edicion o de texto-a-imagen general, aunque su rendimiento optimo se da en el formato de spritesheet.

La innovacion tecnica destacable es el nodo personalizado `TextEncodeBooguEditAnyRes` del repositorio `svntax/ComfyUI-BooguImageEdit-AnyRes`, que corrige un problema del nodo por defecto de ComfyUI (`TextEncodeBooguEdit`) al no respetar la resolucion de la imagen de referencia. El flujo de trabajo recomendado incluye un reescalado de 4x con PixelOE en modo k-centroid para obtener pixel art nitido.

## Capacidades

- Generacion de spritesheets de pixel art con estructura fija de 6x4 frames (24 frames por hoja).
- Animaciones de caminata en cuatro direcciones (abajo, izquierda, derecha, arriba con vista trasera).
- Dos frames de ataque con balanceo de brazo por direccion.
- Un frame de dano (hurt) por direccion.
- Edicion de imagen a partir de una referencia: convierte un personaje existente en su spritesheet manteniendo la apariencia.
- Conversion de imagen a pixel art (funcionalidad secundaria, no garantizada para todos los tipos de imagen).
- Generacion texto-a-imagen convencional usando el modelo base.
- Edicion de imagen convencional (con las limitaciones heredadas del modelo base).
- Soporte de tool calling / function calling: no aplica (modelo de imagen).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no documentadas; los prompts de ejemplo estan en ingles.

## Casos de uso

- Prototipado rapido de personajes para videojuegos 2D: a partir de una descripcion textual o una imagen de referencia, se genera una spritesheet completa de 24 frames lista para importar en Unity, Godot o GameMaker tras el reescalado 4x a 192x192.
- Generacion de assets para game jams: permite obtener animaciones de caminata, ataque y dano de un personaje en minutos, reduciendo el cuello de botella de arte en proyectos con plazos cortos.
- Iteracion de diseno de personajes: el flujo de edicion con imagen de referencia permite mantener la identidad visual del personaje mientras se prueban variaciones de vestuario, color o equipo.
- Creacion de enemigos y NPCs en lote: al fijar la cuadricula de 6x4, se pueden generar multiples personajes (bruja, caballero, hombre lobo en los ejemplos) con el mismo formato de animacion, facilitando la integracion en un pipeline de assets.
- Conversion de arte conceptual a pixel art jugable: la capacidad de imagen-a-pixel-art permite tomar un concept art y obtener una version pixelada coherente con el estilo del juego, aunque el autor advierte que no funciona con todos los tipos de imagen.
- Generacion de hojas de sprites para documentacion o portfolios: util para ilustradores que necesitan mostrar sets de animacion completos sin dibujar cada frame manualmente.
- Integracion en ComfyUI como nodo de un pipeline de generacion de assets: el flujo con `TextEncodeBooguEditAnyRes` y PixelOE permite automatizar la produccion de spritesheets dentro de un grafo de ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base se usa en formato int8, lo que reduce los requisitos frente a fp16, pero no se especifica la cifra exacta.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el uso de cuantizacion int8 del modelo base sugiere que podria ejecutarse en GPU de consumo con VRAM suficiente, pero no se aportan datos.
- Opciones de despliegue: ComfyUI (flujo principal documentado), con el nodo personalizado `TextEncodeBooguEditAnyRes` y el checkpoint `boogu_image_edit_turbo_hotfix_1k_20260708_int8_convrot.safetensors` de Comfy-Org. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a modelos de difusion de imagen en este contexto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (LoRA de spritesheets pixel art sobre modelos de difusion) con datos de parametros, contexto o rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El fondo de la imagen de referencia se transfiere a la spritesheet; se recomienda anadir "White background" al prompt para evitarlo.
- El modelo base conserva sus debilidades: deriva de identidad del personaje y dificultad con cambios de pose complejos.
- La conversion de imagen a pixel art no funciona con todos los tipos de imagen y rinde mejor a 768x768 o escalas similares.
- La salida debe reescalarse 4x (768x768 a 192x192) para obtener pixel art nitido; sin este paso los resultados pueden no ser pixel-perfect.
- El nodo por defecto de ComfyUI (`TextEncodeBooguEdit`) tiene problemas con algunas resoluciones; es necesario usar el nodo personalizado del autor.
- Los prompts de ejemplo estan en ingles; no se documenta soporte multilingue.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base `Boogu/Boogu-Image-0.1-Edit` de forma independiente.
- Riesgo de alucinacion visual: el modelo puede generar frames inconsistentes o anatomia incorrecta en personajes complejos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/svntax-dev/pixel_spritesheet_4walk_combat_32x48_v2
- Modelo base: https://huggingface.co/Boogu/Boogu-Image-0.1-Edit
- Repositorio del modelo base en Comfy-Org: https://huggingface.co/Comfy-Org/Boogu-Image
- Nodo personalizado de ComfyUI: https://github.com/svntax/ComfyUI-BooguImageEdit-AnyRes
- PixelOE (herramienta de pixel art): https://github.com/KohakuBlueleaf/PixelOE
