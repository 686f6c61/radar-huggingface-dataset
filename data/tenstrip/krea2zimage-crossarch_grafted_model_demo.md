# TenStrip/Krea2Zimage-CrossArch_Grafted_Model_Demo

## Resumen

TenStrip/Krea2Zimage-CrossArch_Grafted_Model_Demo es un modelo de text-to-image experimental desarrollado por TenStrip, un creador orientado a resultados, que demuestra una técnica novedosa de fusión de arquitecturas entre dos modelos de difusión: Krea 2 Turbo y Zimage Turbo. El modelo se presenta como una demostración de que es posible "injertar" componentes de atención de un modelo más potente (Krea 2, con 6144 dimensiones ocultas y 48 cabezas de atención) dentro de otro modelo destilado y supuestamente intrenable (Zimage, con 3840 dimensiones y 30 cabezas). El resultado es un checkpoint de 14 GB (aproximadamente) que mezcla los bloques de atención de Krea 2 con los de Zimage, manteniendo la base de Zimage pero con la capacidad de representación visual mejorada del donante.

El modelo es relevante porque demuestra que la fusión de modelos a nivel de componentes de atención (grafting) puede transferir características visuales de un modelo a otro sin entrenamiento, lo que podría abrir nuevas vías para la personalización y mejora de modelos generativos. El autor afirma que es el mejor modelo Zimage hasta la fecha, aunque advierte que el efecto completo se manifiesta en escenarios NSFW. No se dispone de información sobre licencia, idiomas, ni parámetros totales, y no se han publicado benchmarks formales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) con atención de grupo (GQA) fusionada, basado en Zimage Turbo y Krea 2 |
| Parametros totales | No disponible (el checkpoint pesa ~14 GB, pero no se indica el número de parámetros) |
| Parametros activos | No disponible |
| Longitud de contexto | No aplica (modelo de generación de imágenes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (probablemente inglés, pero no especificado) |
| Licencia | No disponible |
| Formato de pesos | safetensors (según los archivos del modelo base, aunque no se confirma) |

## Arquitectura y entrenamiento

El modelo se crea mediante un injerto cruzado de arquitecturas (cross-architecture graft). Se toma como base Zimage Turbo, un modelo de difusión de imágenes con 30 bloques de transformador, cada uno con atención fusionada QKV. El donante es Krea 2 Turbo, un modelo de mayor capacidad (6144 dimensiones ocultas, 48 cabezas de atención, atención con GQA). El proceso utiliza un script (graft_krea_to_zimage.py) que transfiere selectivamente las capas de atención y MLP de Krea 2 a Zimage, bloque por bloque.

La operación clave es la rotación de cabezas de atención: para cada cabeza, se calcula el componente perpendicular del donante respecto a la base, se multiplica por un factor de fuerza (strength = 1.0) y se suma a la cabeza base, seguido de un reescalado para preservar la magnitud original. Esto rota la dirección de cada cabeza de atención de Zimage hacia la correspondiente de Krea 2, sin cambiar su norma. Además, se transfieren las proyecciones de salida (out_proj) y parte del MLP (up y gate) mediante reducción SVD para ajustar las dimensiones. No se tocan los bloques de contexto, ruido, cap_embedder, etc.

El autor indica que el modelo no fue entrenado con RLHF ni DPO, sino que es un injerto puro. No se proporcionan datos sobre el dataset de entrenamiento ni el número de tokens.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con el pipeline estándar de difusión.
- Mejora de la calidad visual de Zimage: según el autor, el injerto de Krea 2 aporta una mejor representación de detalles, estilo y contenido, especialmente en contextos de alta complejidad.
- Fusión de estilos: al transferir cabezas de atención de Krea 2, el modelo hereda parte de la capacidad de Krea 2 para interpretar y renderizar conceptos visuales (aunque no se documenta formalmente).
- No se menciona soporte para tool calling, agentes ni razonamiento multimodal; es exclusivamente generación de imágenes.

## Casos de uso

- Experimentación en investigación sobre fusión de modelos: este checkpoint sirve como prueba de concepto para técnicas de injerto de componentes de atención, útil para estudiar cómo transferir conocimiento entre arquitecturas de difusión.
- Generación de imágenes artísticas y creativas: el modelo puede producir imágenes de alta calidad, con un estilo que mezcla las características de Krea 2 y Zimage, adecuado para ilustración, arte conceptual o diseño gráfico.
- Personalización de modelos de imagen sin entrenamiento: si el injerto funciona correctamente, se podría adaptar un modelo base a un nuevo dominio sin necesidad de fine-tuning, simplemente injertando bloques de otro modelo.
- Prototipado rápido de variantes de modelos: al poder cambiar los parámetros de fuerza y mezcla, se pueden generar múltiples versiones de un mismo modelo base para evaluar su comportamiento.
- Análisis de la interacción entre cabezas de atención: el método permite estudiar qué cabezas contribuyen a qué características visuales, facilitando la interpretabilidad.
- Aplicaciones en entornos donde se requiere generación de imágenes con mayor detalle y estilo que Zimage base, como generación de fondos, texturas o elementos visuales en videojuegos o animación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas como FID, CLIP score ni comparaciones cuantitativas con otros modelos. La evaluación es subjetiva y basada en la observación visual.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la documentación.
- El checkpoint pesa aproximadamente 14 GB en formato safetensors, lo que sugiere que para inferencia en fp16 se necesitará una GPU con al menos 16 GB de VRAM, y probablemente 24 GB para mayor comodidad.
- Dado que es un modelo de difusión de imágenes, se puede ejecutar en ComfyUI u otros pipelines de difusión; no se menciona soporte para vLLM, llama.cpp u otros sistemas de inferencia.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar numéricamente este modelo con alternativas. Como referencia, se puede comparar con sus modelos base:

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 Turbo (donante) | DiT, 6144 hidden, 48 cabezas, GQA | No disponible | N/A | No disponible | Comercial, con restricciones |
| Zimage Turbo (base) | DiT, 3840 hidden, 30 cabezas | No disponible | N/A | No disponible | Open (Comfy-Org) |
| TenStrip/Krea2Zimage (este) | DiT híbrido, 30 bloques | No disponible | N/A | No disponible | Demo experimental |

No hay datos de benchmarks comparativos.

## Limitaciones y advertencias

- Modelo experimental y sin garantías: es una demostración técnica, no un producto estable.
- El autor indica que el efecto completo se manifiesta en contenido NSFW (desnudos), lo que puede generar problemas de moderación y uso responsable. El modelo podría producir contenido inapropiado si se le pide.
- No se ha verificado la compatibilidad con LoRAs u otros adaptadores; el autor no está seguro de si funciona.
- La licencia es desconocida, lo que impide su uso comercial sin una revisión legal.
- La técnica de injerto puede introducir artefactos o inestabilidad en la generación, aunque el autor afirma que no hay pérdida de calidad.
- No se han realizado pruebas formales de sesgo, alucinación o seguridad.

## Enlaces

- Modelo: https://huggingface.co/TenStrip/Krea2Zimage-CrossArch_Grafted_Model_Demo
- Script de injerto (no enlazado en la card, pero se menciona que está subido en el repo)
- Krea 2 Turbo tutorial (referencia): https://www.nextdiffusion.ai/tutorials/krea-2-uncensored-text-to-image-generations-in-comfyui
- Krea 2 oficial: https://www.krea.ai/krea-2
- Otros modelos del autor: https://huggingface.co/TenStrip/Krea2-H3-Style-Lora y https://civitai.red/models/2447875/ltx23-10eros
