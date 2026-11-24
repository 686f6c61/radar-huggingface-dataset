# Teriks/Wan-Animate-2-14B-quants

## Resumen

Teriks/Wan-Animate-2-14B-quants es un conjunto de cuantizaciones del transformer del modelo Wan-AI/Wan2.2-Animate-2-14B-Diffusers, un modelo de difusión para animación de vídeo. El autor, Teriks, publica 12 formatos GGUF (desde Q2_K hasta Q8_0, incluyendo IQ4_NL e IQ4_XS) y dos cuantizaciones en safetensors para ComfyUI (float8_e4m3fn e int8_tensorwise), generadas con la herramienta dgenerate 6.0.0. No se trata de un modelo nuevo, sino de una redistribución optimizada para inferencia con memoria reducida.

El modelo base es Wan2.2-Animate-2-14B, que según el recuento real de parámetros del repositorio (safetensors) contiene 16.394.878.784 parámetros, lo que corresponde a la variante "14B" del transformer de difusión. Este repositorio no incluye el pipeline completo (VAE, text encoder, scheduler), solo el componente `transformer`; para usarlo hay que mantener el repositorio original como modelo y cargar el archivo cuantizado con la opción de componente correspondiente.

La relevancia de esta ficha radica en que permite ejecutar un modelo de animación de vídeo de gran tamaño en hardware más modesto, especialmente en ComfyUI con ComfyUI-GGUF. La licencia no está declarada en el repositorio, pero el autor indica que se aplica la licencia del modelo fuente, por lo que conviene consultarla en el repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (componente `transformer` de Wan2.2-Animate-2-14B-Diffusers) |
| Parametros totales | 16.394.878.784 (dato real del repositorio safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K, Q4_0, Q4_1, Q4_K, Q5_0, Q5_1, Q5_K, Q6_K, Q8_0, IQ4_NL, IQ4_XS; safetensors ComfyUI: float8_e4m3fn, int8_tensorwise |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; se aplica la licencia del modelo fuente Wan-AI/Wan2.2-Animate-2-14B-Diffusers |
| Formato de pesos | GGUF y safetensors (ComfyUI) |
| Tamano del repositorio | 157,8 GB |
| Modelo base | Wan-AI/Wan2.2-Animate-2-14B-Diffusers |
| Herramienta de cuantizacion | dgenerate 6.0.0 |
| Layout de tensores | ComfyUI (`--comfy`) |

## Arquitectura y entrenamiento

La arquitectura del componente cuantizado es la del transformer de difusión de Wan2.2-Animate-2-14B. No se dispone de información detallada en la model card sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos corresponden al modelo base y no están incluidos en la información proporcionada.

La innovación técnica de este repositorio es la cuantización del transformer en 12 formatos GGUF y dos formatos safetensors para ComfyUI, generados con dgenerate 6.0.0. Los nombres de los tensores siguen el layout de ComfyUI, y los archivos GGUF incluyen un key map para que ComfyUI y ComfyUI-GGUF puedan cargarlos. Si un componente no tiene key map, la carga produce un error. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal en esta información.

## Capacidades

- Generación de animación de vídeo a partir de un modelo de difusión Wan2.2-Animate.
- Ejecución del componente transformer en ComfyUI mediante ComfyUI-GGUF o safetensors cuantizados.
- Carga con dgenerate usando el repositorio original como modelo y el archivo cuantizado como componente.
- Cuantizaciones de 2 a 8 bits para ajustar el equilibrio entre calidad y memoria.
- No se dispone de información sobre tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio o thinking mode; estas capacidades no están documentadas en la model card.

## Casos de uso

- Animación de personajes en ComfyUI: cargar `transformer-Q8_0-comfy.gguf` o `transformer-float8_e4m3fn-comfy.safetensors` junto al repositorio base para generar animaciones con menor uso de VRAM que el modelo original.
- Prototipado en GPU de consumo: usar `transformer-Q4_K-comfy.gguf` (8,6 GB) o `transformer-IQ4_XS-comfy.gguf` (8,1 GB) para probar el pipeline en tarjetas con 12-16 GB de VRAM.
- Despliegue en entornos con memoria limitada: emplear `transformer-Q2_K-comfy.gguf` (5,0 GB) para pruebas rápidas o generación de baja resolución donde la fidelidad no sea crítica.
- Integración en pipelines de dgenerate: usar el comando documentado con `--sub-command quantize` para regenerar o adaptar cuantizaciones a otros formatos.
- Evaluación comparativa de cuantizaciones: ejecutar el mismo prompt con Q4_0, Q5_K y Q8_0 para medir la degradación de calidad frente al coste de memoria.
- Distribución de modelos en entornos con ancho de banda limitado: elegir el archivo GGUF más pequeño que mantenga una calidad aceptable para reducir el tamaño de descarga frente a los 157,8 GB del repositorio completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el transformer: aproximadamente 5,0 GB (Q2_K), 6,6 GB (Q3_K), 8,1-8,6 GB (IQ4_XS, IQ4_NL, Q4_0, Q4_K), 9,6 GB (Q4_1), 10,5 GB (Q5_0, Q5_K), 11,5 GB (Q5_1), 12,5 GB (Q6_K), 15,3 GB (float8_e4m3fn, int8_tensorwise) y 16,2 GB (Q8_0). Hay que sumar la memoria del VAE, el text encoder y el resto del pipeline.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, las cuantizaciones Q4 y Q5 podrían caber en GPU de consumo con 12-16 GB, y Q8_0 o los safetensors en GPU de 24 GB o superiores; esta estimación es orientativa y no está confirmada por el autor.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF, dgenerate 6.0.0 y carga de safetensors cuantizados en ComfyUI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teriks/Wan-Animate-2-14B-quants | 16.394.878.784 | no disponible | GGUF (12) y safetensors (2) | la del modelo fuente | Hugging Face |
| Wan-AI/Wan2.2-Animate-2-14B-Diffusers | no disponible en esta ficha | no disponible | safetensors originales | no disponible en esta ficha | Hugging Face |
| Otras cuantizaciones de Wan2.2-Animate | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo se cuantiza el componente `transformer`; el resto del pipeline (VAE, text encoder, scheduler) debe tomarse del repositorio original.
- Los archivos GGUF requieren un key map para la arquitectura; un componente sin key map produce un error al cargar.
- La cuantización a 2-4 bits puede degradar la calidad de la animación generada; no se documentan métricas de degradación.
- La licencia no está declarada en el repositorio; el autor remite a la licencia del modelo fuente, que debe verificarse antes de cualquier uso comercial.
- No se dispone de información sobre sesgos, riesgo de alucinación, limitaciones de contexto o idioma del modelo base en la información proporcionada.
- El repositorio ocupa 157,8 GB e incluye archivos de ejecuciones de cuantización anteriores; conviene descargar solo el archivo necesario.
- No se documentan requisitos mínimos de hardware ni latencias, por lo que las estimaciones de VRAM son orientativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Teriks/Wan-Animate-2-14B-quants
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-Animate-2-14B-Diffusers
- Herramienta dgenerate: https://github.com/Teriks/dgenerate
