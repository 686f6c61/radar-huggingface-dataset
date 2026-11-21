# Teriks/Kandinsky-5.0-T2I-Lite-quants

## Resumen

Teriks/Kandinsky-5.0-T2I-Lite-quants es un conjunto de cuantizaciones del modelo de generación de imágenes texto-a-imagen Kandinsky 5.0 T2I Lite, desarrollado originalmente por el equipo de Kandinsky (kandinskylab) y publicado en su variante afinada con supervisión (SFT) en formato Diffusers. Este repositorio, mantenido por Teriks, no contiene el modelo original sino versiones comprimidas del componente `transformer` (la red `Kandinsky5Transformer3DModel`) en 12 formatos GGUF (desde Q2_K hasta IQ4_XS) y 2 formatos safetensors para ComfyUI (`float8_e4m3fn` e `int8_tensorwise`).

El propósito de este repositorio es facilitar el despliegue del modelo en hardware con recursos limitados: las cuantizaciones reducen el peso del transformer desde los aproximadamente 6.022 millones de parámetros en precisión completa hasta ficheros de entre 1,9 GB (Q2_K) y 6,0 GB (Q8_0), lo que permite ejecutarlo en GPU de consumo. Las cuantizaciones han sido generadas con la herramienta `dgenerate` 6.0.0, del mismo autor, y están pensadas para integrarse en flujos de trabajo de ComfyUI o en pipelines basados en llama.cpp.

Es relevante ahora porque la familia Kandinsky 5.0 (con soporte texto-a-imagen y texto-a-vídeo) ha despertado interés en la comunidad open source, y disponer de versiones GGUF ligeras amplía enormemente el rango de hardware capaz de ejecutar el modelo. No obstante, la información pública disponible sobre esta variante cuantizada es muy escasa: no se detallan licencia, idiomas ni benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer 3D (`Kandinsky5Transformer3DModel`), pipeline `Kandinsky5T2IPipeline` (difusión texto-a-imagen) |
| Parámetros totales | 6.022.080.576 (componente transformer, dato de safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: Q2_K, Q3_K, Q4_0, Q4_1, Q4_K, Q5_0, Q5_1, Q5_K, Q6_K, Q8_0, IQ4_NL, IQ4_XS; safetensors ComfyUI: float8_e4m3fn, int8_tensorwise |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que se aplica la licencia del modelo fuente) |
| Formato de pesos | GGUF (nombres de tensor originales, `-llama` para llama.cpp) y safetensors ComfyUI (`-comfy`) |

## Arquitectura y entrenamiento

El modelo base es un pipeline de difusión texto-a-imagen (`Kandinsky5T2IPipeline`) cuyo componente principal es `Kandinsky5Transformer3DModel`, un transformer tridimensional de aproximadamente 6.022 millones de parámetros. Este repositorio no entrena ni modifica el modelo: solo aplica cuantización post-entrenamiento sobre el transformer del checkpoint SFT `kandinskylab/Kandinsky-5.0-T2I-Lite-sft-Diffusers`.

Las cuantizaciones se generaron con `dgenerate` 6.0.0 mediante el subcomando `quantize`, limitado al subdirectorio `transformer`. Se ofrecen dos familias: GGUF (12 variantes de la familia K-quant e I-quant de llama.cpp) y safetensors para ComfyUI en `float8_e4m3fn` e `int8_tensorwise`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo fuente.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (texto-a-imagen) mediante el pipeline de difusión Kandinsky 5.0 T2I Lite.
- Ejecución en ComfyUI mediante los ficheros safetensors `-comfy` (`float8_e4m3fn` e `int8_tensorwise`).
- Ejecución en entornos basados en llama.cpp mediante los ficheros GGUF con nombres de tensor `-llama`.
- Amplio abanico de niveles de compresión: desde Q2_K (1,9 GB) hasta Q8_0 (6,0 GB), lo que permite ajustar calidad y uso de memoria.
- No se dispone de información sobre tool calling, capacidades de agente, multilingüismo explícito ni modos especiales (thinking, visión, audio) en la documentación proporcionada.

## Casos de uso

- Generación de imágenes en GPU de consumo: con la cuantización Q4_K (3,2 GB) o IQ4_XS (3,0 GB) el transformer cabe en tarjetas con 8-12 GB de VRAM, permitiendo generar ilustraciones o conceptos visuales en equipos de sobremesa.
- Prototipado rápido en ComfyUI: los ficheros `float8_e4m3fn` e `int8_tensorwise` con nombres de tensor ComfyUI se cargan directamente en flujos de trabajo de ComfyUI, ideales para iterar sobre prompts y estilos sin montar infraestructura adicional.
- Despliegue en servidores con VRAM limitada: la variante Q8_0 (6,0 GB) ofrece una calidad cercana a la original con un consumo de memoria contenido, adecuada para servicios de generación de imágenes de baja latencia en una sola GPU.
- Experimentación académica con difusión cuantizada: investigadores pueden comparar la calidad de salida entre los 14 formatos para estudiar el impacto de la cuantización en modelos de difusión.
- Generación de recursos para videojuegos y diseño: uso de cuantizaciones intermedias (Q5_K, Q6_K) para producir arte conceptual y texturas con un equilibrio razonable entre fidelidad y requisitos de hardware.
- Integración en pipelines automatizados de creación de contenido: al ser ficheros GGUF, pueden encadenarse con herramientas de llama.cpp en flujos por lotes para generar bancos de imágenes a partir de listas de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el transformer según cuantización: Q2_K ~1,9 GB; Q3_K ~2,4 GB; IQ4_XS ~3,0 GB; IQ4_NL y Q4_0/Q4_K ~3,2 GB; Q4_1 ~3,5 GB; Q5_0/Q5_K ~3,9 GB; Q5_1 ~4,2 GB; Q6_K ~4,6 GB; Q8_0, float8_e4m3fn e int8_tensorwise ~5,6-6,0 GB. A esto hay que sumar la memoria del resto del pipeline (VAE, text encoder), no cuantizados en este repositorio.
- GPU recomendadas: no disponible de forma explícita; por tamaño, las cuantizaciones bajas (Q2_K a IQ4_XS) son aptas para GPUs de consumo tipo RTX 3060/4060 (8-12 GB), mientras que Q8_0 y los safetensors de 5,6 GB requieren al menos 12-16 GB para operar con holgura.
- Cabe en GPU de consumo: sí, al menos las cuantizaciones GGUF de menor tamaño, siempre que se sume la memoria del resto del pipeline.
- Opciones de despliegue: ComfyUI (safetensors `-comfy`), llama.cpp (GGUF con nombres `-llama`), y `dgenerate` 6.0.0. No se documentan vLLM ni TGI para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros (transformer) | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| Teriks/Kandinsky-5.0-T2I-Lite-quants | 6.022 M | GGUF + safetensors cuantizados | la del modelo fuente (no disponible) | Hugging Face |
| kandinskylab/Kandinsky-5.0-T2I-Lite-sft-Diffusers | 6.022 M | safetensors (precisión completa) | no disponible | Hugging Face |
| Otras cuantizaciones de Kandinsky 5.0 | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce pérdida de calidad en la generación de imágenes; las variantes Q2_K y Q3_K son las más agresivas y pueden degradar notablemente el resultado.
- Este repositorio solo contiene el transformer cuantizado: es necesario descargar el modelo base `kandinskylab/Kandinsky-5.0-T2I-Lite-sft-Diffusers` para obtener la configuración y el resto de componentes del pipeline.
- La licencia no está especificada en el repositorio; el autor remite a la licencia del modelo fuente, que debe verificarse antes de cualquier uso comercial.
- No se dispone de información sobre sesgos, riesgo de alucinación visual, idiomas soportados ni limitaciones de contexto del prompt.
- Los ficheros GGUF con nombres `-llama` y los originales no son intercambiables con los `-comfy`; hay que usar el fichero adecuado según el runtime.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Teriks/Kandinsky-5.0-T2I-Lite-quants
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-5.0-T2I-Lite-sft-Diffusers
- Herramienta de cuantización dgenerate: https://github.com/Teriks/dgenerate
