# taurusduan/MiniMax-H3-x-Z-Image-bf16

## Resumen

Este repositorio contiene una reconstrucción en BF16 del modelo FL2VA ZS05 empleado en el workflow MiniMax-H3 × Z-Image. El autor, taurusduan, ha reconstruido los pesos a partir del modelo pruned original en BF16 y de los pesos ZS05 en INT8/FP8, parcheando únicamente los 21 tensores `q_norm` de los bloques 29 a 49 que faltaban en la versión pruned. El resultado es un archivo `minimax_h3_fl2va_pruned_zs05_bf16.safetensors` de aproximadamente 37,46 GiB, verificado bit a bit en los tensores afectados.

El modelo forma parte de un ecosistema más amplio: MiniMax-H3 es un sistema generativo omni-modal que soporta texto, imagen, vídeo y audio, y el injerto Z-Image incorpora la atención espacial de Z-Image sobre el motor de H3 para mejorar la riqueza de detalles y texturas en la generación de vídeo. Este repositorio se complementa con un modelo REF2VA BF16 disponible en otro repositorio (joeygambino/MiniMax-H3-x-Z-Image-native) para poder construir el híbrido B25-49.

La relevancia de este modelo radica en que permite ejecutar el workflow de MiniMax-H3 × Z-Image con precisión BF16 completa, sin depender de conversiones aproximadas ni de pesos cuantizados, en entornos de investigación e inferencia local con ComfyUI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión FL2VA (parte del sistema MiniMax-H3) con atención espacial de Z-Image |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no autogenerativo de texto) |
| Tipos de cuantizacion | BF16 (reconstruido a partir de INT8/FP8 ZS05) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una reconstrucción de pesos, no un entrenamiento nuevo. Se parte del modelo pruned FL2VA BF16 original y se le incorporan los valores `q_norm` de la versión ZS05 (INT8/FP8), que se verificaron idénticos tras la reconstrucción. Solo se sustituyeron 21 tensores `q_norm` (5,25 KiB en total) sobre un modelo de ~37,46 GiB, manteniendo el resto de bytes sin cambios.

MiniMax-H3, la base, es un sistema generativo omni-modal que unifica comprensión de texto, imagen, vídeo y audio, y puede generar vídeo con audio estéreo nativo hasta resoluciones de 2K y duraciones de 15 segundos. El injerto Z-Image modifica los parámetros de normalización de query (q_norm) para transferir el perfil de atención espacial de Z-Image al motor de H3, lo que produce texturas y conjuntos más ricos sin necesidad de ajuste por fotograma.

## Capacidades

- Generación de vídeo con audio estéreo nativo (hasta 2K de resolución y 15 segundos de duración, según las capacidades de MiniMax-H3).
- Generación de imágenes estáticas mediante el workflow de ComfyUI (text-to-image e image-to-image).
- Edición de imágenes por referencia (REF2VA) cuando se combina con el modelo REF2VA BF16 del repositorio complementario.
- Integración con ComfyUI mediante nodos y workflows específicos (por ejemplo, ComfyUI-MiniMax-H3-Image-Studio).
- Soporte de construcción de modelos híbridos B25-49 combinando FL2VA ZS05 BF16 con REF2VA ZS05 BF16.
- Reconstrucción exacta en BF16 de los tensores `q_norm` ZS05, verificada bit a bit, lo que garantiza fidelidad en la inferencia.

## Casos de uso

- Generación de vídeo de alta calidad con detalle espacial mejorado: el modelo FL2VA ZS05 BF16 permite obtener texturas y conjuntos más ricos en la salida de vídeo, adecuado para producción audiovisual experimental o prototipado.
- Edición de imágenes por referencia (REF2VA): combinando con el modelo REF2VA BF16, se pueden modificar imágenes existentes manteniendo la identidad del sujeto y aplicando cambios de estilo o composición.
- Flujos de trabajo en ComfyUI: el modelo está pensado como checkpoint drop-in para ComfyUI, facilitando la integración en pipelines existentes de generación y edición.
- Investigación en transferencia de atención espacial: los pesos reconstruidos permiten estudiar el efecto del injerto Z-Image sobre el comportamiento del modelo base H3.
- Generación de contenido para storyboards o previsualización: dado que MiniMax-H3 soporta vídeo con audio, el modelo puede usarse para crear clips cortos con sonido sincronizado.
- Desarrollo de aplicaciones de vídeo multimodal: al ser parte de un sistema omni-modal, puede integrarse en sistemas que requieran comprensión y generación conjunta de texto, imagen, vídeo y audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye verificaciones de integridad de tensores (conteo, parcheo, verificación bit-exacta) pero no métricas de calidad de generación ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo BF16 ocupa ~37,46 GiB, por lo que se requiere al menos 40 GB de VRAM para cargar el modelo en memoria sin cuantización adicional. Una GPU con 48 GB (por ejemplo, A6000 o A40) sería necesaria, o un A100 de 80 GB para mayor margen.
- GPU recomendadas: A100 80GB, H100 80GB, o GPUs de consumo de gama alta con 24 GB (RTX 4090) no son suficientes en BF16; se necesitaría cuantización a FP8 o INT8 para ajustarse a 24 GB, aunque no se proporcionan versiones cuantizadas en este repositorio.
- Opciones de despliegue: al ser un modelo de difusión para ComfyUI, se puede ejecutar mediante el propio ComfyUI con soporte de safetensors. También es posible usar otras herramientas que carguen modelos de difusión en formato safetensors, aunque no se especifican.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de difusión de vídeo en la información proporcionada. El modelo es una reconstrucción específica para el workflow MiniMax-H3 × Z-Image, sin métricas comparativas frente a alternativas como otros modelos de difusión de vídeo (por ejemplo, Stable Video Diffusion, Mochi, etc.). Se puede considerar comparable al modelo original MiniMax-H3, pero este repositorio solo aporta la variante FL2VA ZS05 BF16.

## Limitaciones y advertencias

- Se trata de una reconstrucción comunitaria, no un modelo oficial de MiniMax. El autor indica que es para investigación e inferencia local, no para producción comercial sin validación adicional.
- El modelo solo cubre la parte FL2VA; el componente REF2VA debe descargarse por separado desde otro repositorio, lo que añade complejidad al despliegue.
- Tamaño elevado (~37,46 GiB en BF16) que requiere hardware de gama alta; no se ofrecen versiones cuantizadas en este repositorio.
- No se han publicado evaluaciones de calidad (benchmarks) ni estudios de sesgos o alucinaciones. La ausencia de datos de rendimiento impide conocer su comportamiento real frente a otros modelos.
- La licencia Apache-2.0 permite uso comercial, pero la naturaleza reconstruida y no verificada por el desarrollador original puede implicar riesgos de calidad o compatibilidad.
- El modelo se basa en MiniMax-H3, que es un sistema omni-modal; sin embargo, no se especifican los idiomas soportados ni las restricciones idiomáticas de la generación de vídeo o imagen.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/taurusduan/MiniMax-H3-x-Z-Image-bf16
- Repositorio híbrido relacionado: https://huggingface.co/taurusduan/MiniMax-H3-x-Z-Image-hybrid
- Repositorio native (REF2VA BF16): https://huggingface.co/taurusduan/MiniMax-H3-x-Z-Image-native
- Artículo sobre el injerto Z-Image en MiniMax-H3: https://comfyui-wiki.com/en/news/2026-08-22-minimax-h3-z-image
- GitHub de MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- GitHub de nodos ComfyUI para MiniMax-H3 Image Studio: https://github.com/astropuzzo/ComfyUI-MiniMax-H3-Image-Studio
