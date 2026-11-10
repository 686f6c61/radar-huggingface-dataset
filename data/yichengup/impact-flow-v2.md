# yichengup/Impact-Flow-v2

## Resumen

Impact-Flow-v2 es un adaptador LoRA de rango 16 para el modelo de generación de vídeo a partir de imagen MiniMax H3, desarrollado por el usuario yichengup y publicado en Hugging Face. Su propósito es concreto: inyectar en el modelo base un comportamiento de movimiento de impacto y combate, es decir, peso en el contacto, seguimiento direccional tras el golpe y respuesta de cámara ante un impacto contundente. No es un modelo completo, sino un complemento que se carga sobre un checkpoint de MiniMax H3.

El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador de bajo rango y no con pesos completos. La librería declarada es `minimax-h3` y el pipeline es `image-to-video`, de modo que el flujo de trabajo esperado es tomar una imagen de referencia y animarla con el modelo base, aplicando el LoRA para orientar el estilo del movimiento.

Su relevancia es acotada pero práctica: permite ajustar el realismo de las secuencias de acción en un pipeline de ComfyUI sin reentrenar el modelo base, con una fuerza recomendada de 0,8 y un rango de ajuste documentado entre 0,6 y 1,0. La información pública disponible es escasa: no hay datos de entrenamiento, benchmarks ni idiomas declarados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax H3 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement |
| Formato de pesos | no disponible |
| Rango del adaptador | 16 |
| Fuerza recomendada | 0,8 (rango 0,6–1,0) |
| Modelo base | Comfy-Org/MiniMax-H3 |
| Tamaño del repositorio | 0,2 GB |
| Pipeline | image-to-video |
| Librería | minimax-h3 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16, no un transformer completo. Se aplica sobre MiniMax H3, un modelo de generación de vídeo desde imagen, y su cobertura de tensores, convenciones de nombres de claves y ajustes de entrenamiento se remiten en la model card a un archivo `DETAILS.md` alojado en el repositorio. No se especifican en la información disponible el número de pasos de entrenamiento, el volumen de vídeo utilizado, la composición del dataset ni si se emplearon técnicas de preferencia como RLHF o DPO.

La innovación declarada es de dominio: el adaptador está entrenado para modelar la física percibida de un impacto, incluyendo el peso del contacto, el arrastre direccional posterior y la reacción de cámara. No se documentan innovaciones arquitectónicas propias, como atención lineal o decodificación especulativa, más allá de las que pueda incorporar el modelo base.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video) mediante el modelo base MiniMax H3.
- Modulación del movimiento hacia secuencias de impacto y combate: contacto con peso, seguimiento direccional y respuesta de cámara.
- Ajuste de intensidad del efecto mediante la fuerza del LoRA, con 0,8 como valor de partida.
- Integración en flujos de ComfyUI mediante cargadores LoRA estándar, como `LoraLoaderModelOnly`.
- Compatibilidad con cualquier checkpoint de MiniMax H3 en ComfyUI.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades adicionales como audio o visión comprensiva.

## Casos de uso

- Previsualización de secuencias de acción: animar un fotograma clave de una pelea y aplicar el LoRA a 0,8 para obtener un primer pase con impacto creíble antes de pasar a producción.
- Storyboarding de escenas de combate: generar variantes rápidas de un mismo plano con fuerzas entre 0,6 y 1,0 para comparar la lectura del golpe y elegir la más adecuada.
- Prototipado de videojuegos: producir animaciones de referencia para ataques cuerpo a cuerpo que sirvan de guía al equipo de animación 3D.
- Contenido para redes y trailers: crear planos de impacto con respuesta de cámara para piezas cortas, ajustando la fuerza del adaptador según el ritmo del montaje.
- Iteración de dirección de fotografía: evaluar cómo reacciona la cámara virtual a un impacto fuerte y corregir encuadre y distancia antes del render final.
- Pruebas de concepto en ComfyUI: encadenar el LoRA con otros nodos del grafo para validar pipelines de image-to-video con estilos de movimiento diferenciados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador pesa 0,2 GB, pero requiere cargar el checkpoint completo de MiniMax H3, cuyos requisitos de VRAM no se detallan en la información disponible.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; depende enteramente del modelo base.
- Despliegue: ComfyUI con un cargador LoRA estándar (`LoraLoaderModelOnly`) sobre un checkpoint de MiniMax H3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros adaptadores LoRA para MiniMax H3 ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La licencia es la MiniMax H3 Community License Agreement, no una licencia open source estándar; conviene revisar `LICENSE` y `NOTICE` antes de cualquier uso comercial.
- Prohibido generar imágenes de personas reales sin consentimiento, contenido ilegal o cualquier uso vetado por la licencia upstream.
- El adaptador puede producir movimiento errático o tembloroso; el autor recomienda bajar la fuerza hacia 0,6 en ese caso.
- Con fuerzas demasiado bajas los impactos pueden percibirse sin peso; el rango útil documentado es 0,6–1,0.
- No se documentan sesgos, tasas de alucinación ni limitaciones de contexto o idioma.
- Al ser un LoRA de dominio específico, fuera de escenas de impacto y combate puede degradar el comportamiento del modelo base.
- La responsabilidad sobre el contenido generado recae en el usuario, según la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yichengup/Impact-Flow-v2
- Detalles técnicos: https://huggingface.co/yichengup/Impact-Flow-v2/blob/main/DETAILS.md
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
