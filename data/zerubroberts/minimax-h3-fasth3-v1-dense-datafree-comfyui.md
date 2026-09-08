# zerubroberts/MiniMax-H3-FastH3-v1-dense-datafree-ComfyUI

## Resumen

Este repositorio contiene un adaptador LoRA para MiniMax-H3, el modelo de generación de video de MiniMax-AI. El adaptador es una conversión para ComfyUI del LoRA FastVideo-FastH3-4-step-Preview-v1-LoRA, en su variante dense-datafree. El objetivo es permitir la generación de video a partir de texto en solo 4 pasos de muestreo (euler/simple), reduciendo el coste computacional frente al modelo base.

El trabajo ha sido realizado por el usuario zerubroberts, que ha adaptado el layout de claves del adaptador original al formato que espera ComfyUI para MiniMax-H3. El repositorio tiene un tamaño de 1.0 GB y contiene el archivo adapter_model.safetensors. La licencia es minimax-h3-community-license, heredada del adaptador original.

Este modelo es relevante para usuarios de ComfyUI que quieran probar destilación de video a 4 pasos sin tener que gestionar el formato original de FastVideo. No se trata de un modelo completo, sino de un adaptador que requiere el modelo base MiniMax-H3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (adaptador LoRA sobre MiniMaxAI/MiniMax-H3) |
| Parámetros totales | No disponible (el repositorio contiene un adaptador LoRA, no los pesos completos) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el adaptador se distribuye sin cuantización; el modelo base objetivo se describe como pruned int8_convrot fl2va) |
| Idiomas soportados | No disponible |
| Licencia | minimax-h3-community-license |
| Formato de pesos | Safetensors (adapter_model.safetensors, convertido para ComfyUI) |
| Modelo base | MiniMaxAI/MiniMax-H3 |
| Tipo de adaptador | LoRA (FastH3 v1 dense-datafree) |
| Tamaño del repositorio | 1.0 GB |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo completo, sino un adaptador LoRA. El adaptador original es FastVideo/FastVideo-FastH3-4-step-Preview-v1-LoRA, en su variante dense-datafree. Se ha convertido al layout de claves de ComfyUI para MiniMax-H3 mediante NikoDemon80/ComfyUI-FastH3-Lora-Converter con la opción --adaln drop.

El entrenamiento es una destilación a 4 pasos (FastH3) a partir de MiniMax-H3, con el objetivo de reducir el número de pasos de muestreo manteniendo la calidad. No se proporcionan datos sobre el dataset ni el proceso de entrenamiento. El adaptador está pensado para usarse sobre la base pruned int8_convrot fl2va de MiniMax-H3.

## Capacidades

- Generación de video a partir de texto (text-to-video) mediante ComfyUI.
- Inferencia acelerada a 4 pasos con euler/simple; el autor del conversor recomienda 6 pasos.
- Integración con ComfyUI mediante LoraLoaderModelOnly a 1.0.
- No soporta fl2va/ref2va (solo texto a video).
- No se documentan capacidades de tool calling, agentes, razonamiento ni soporte multilingüe.

## Casos de uso

- Previsualización de ideas: al requerir solo 4 pasos de muestreo, permite generar clips cortos desde un prompt en ComfyUI para evaluar rápidamente conceptos visuales antes de invertir tiempo en generaciones más largas.
- Prototipado de grafos en ComfyUI: se carga con LoraLoaderModelOnly a 1.0, lo que facilita la experimentación con distintos prompts, schedulers y resoluciones sin reentrenar nada.
- Storyboarding para producción audiovisual: las secuencias generadas pueden usarse como referencia de planos para guiones, animaticos o presentaciones.
- Contenido creativo para redes sociales: permite producir clips abstractos o surrealistas a partir de descripciones textuales, aprovechando la velocidad de la destilación.
- Investigación en destilación de modelos de video: sirve como caso de estudio de un adaptador destilado a 4 pasos; se puede comparar visualmente con el modelo base o con otros adaptadores.
- Validación de pipelines de conversión: el repositorio documenta el proceso de conversión de FastVideo a ComfyUI, útil para desarrolladores que quieran convertir otros LoRA de video.
- Docencia en flujos de video generativo: material práctico para talleres sobre ComfyUI, LoRA y destilación de diffusion models.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de latencia, throughput ni comparativas numericas con otros modelos. El sitio web de FastH3 ofrece muestras y comparativas visuales, pero no se han publicado benchmarks numericos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No se puede determinar sin datos del modelo base MiniMax-H3.
- Opciones de despliegue: ComfyUI (LoraLoaderModelOnly); no se indican opciones vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Diferencias |
|---|---|---|
| zerubroberts/MiniMax-H3-FastH3-v1-dense-datafree-ComfyUI | Adaptador LoRA convertido para ComfyUI | Destilado a 4 pasos, solo texto a video, requiere base pruned int8_convrot fl2va |
| FastVideo/FastVideo-FastH3-4-step-Preview-v1-LoRA | Adaptador LoRA original | Misma destilación, pero sin la conversión para ComfyUI |
| MiniMaxAI/MiniMax-H3 | Modelo base completo | Generación de video de referencia; no es un adaptador |

No se dispone de parámetros, contexto ni benchmarks para comparar de forma cuantitativa.

## Limitaciones y advertencias

- Solo texto a video; no genera video desde imagen (fl2va) ni desde referencia (ref2va).
- Requiere la base pruned int8_convrot fl2va; puede no funcionar con otras versiones de MiniMax-H3.
- La licencia minimax-h3-community-license puede imponer restricciones de uso comercial; revisar el texto de la licencia.
- Al ser un adaptador destilado, puede presentar artefactos o pérdida de calidad frente al modelo base.
- No se han publicado evaluaciones de sesgos, alucinaciones ni seguridad.
- La conversión con --adaln drop puede afectar al comportamiento del adaptador; se recomienda probar 4 y 6 pasos.
- No hay datos de descargas ni comunidad activa; es un repositorio nuevo (1 like, 0 descargas).

## Enlaces

- HuggingFace: https://huggingface.co/zerubroberts/MiniMax-H3-FastH3-v1-dense-datafree-ComfyUI
- GitHub MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- FastH3: FastVideo 4-Step H3 Model & Setup: https://fasth3.org/
- ComfyUI-FastH3-Lora-Converter: https://github.com/NikoDemon80/ComfyUI-FastH3-Lora-Converter
