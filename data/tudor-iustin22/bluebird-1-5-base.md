# tudor-iustin22/Bluebird-1.5-Base

## Resumen

Bluebird-1.5-Base es un modelo de lenguaje publicado en Hugging Face por el usuario tudor-iustin22. Se distribuye en formato safetensors con código personalizado (`custom_code`) y la etiqueta `fabric`, lo que indica que requiere cargar módulos propios del repositorio para su ejecución y que no es un transformer estándar de la librería `transformers` sin más. Cuenta con 742.528.520 parámetros totales, lo que lo sitúa en la franja de los modelos de aproximadamente 0,7 mil millones de parámetros, y el repositorio ocupa 1,5 GB.

El modelo se presenta como versión "Base", es decir, presumiblemente sin ajuste por instrucciones ni alineación conversacional, orientado a servir como punto de partida para fine-tuning. Su relevancia actual es limitada y de nicho: se trata de una publicación con 25 descargas y 3 likes, sin documentación asociada en la información disponible, sin licencia declarada y sin idiomas especificados. No hay evidencia de benchmarks, paper técnico ni blog de presentación.

La información pública disponible es muy escasa: no se ha publicado pipeline, licencia, idiomas ni datos de entrenamiento. Esta ficha recoge lo verificable (tamaño, formato, fechas, autor) y marca explícitamente como "no disponible" todo aquello que no consta en las fuentes consultadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `fabric` y `custom_code`; no se especifica transformer, MoE ni híbrida) |
| Parametros totales | 742.528.520 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `custom_code` requerido para la carga) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La presencia de la etiqueta `fabric` y del flag `custom_code` en el repositorio indica que la implementación depende de código propio incluido en el propio repo de Hugging Face, y que la carga mediante `AutoModel` estándar probablemente fallará sin `trust_remote_code=True`. No se especifica si se trata de un transformer denso, una arquitectura híbrida, un modelo con atención lineal o cualquier otra variante.

Tampoco consta el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o SFT. Al tratarse de una variante "Base", es razonable asumir que no ha pasado por alineación por preferencias, pero esto es una inferencia por la nomenclatura y no un dato confirmado en las fuentes. No se han identificado innovaciones técnicas documentadas (decodificación especulativa, atención lineal, mezcla de expertos, etc.).

## Capacidades

- Generación de texto autoregresiva: capacidad esperable en un modelo de lenguaje base de 742 millones de parámetros, aunque no hay evaluación publicada que lo confirme.
- Punto de partida para fine-tuning: al ser una variante "Base", está pensado para ajuste posterior en tareas concretas (clasificación, extracción, generación guiada) en lugar de uso conversacional directo.
- Tool calling / function calling: no disponible; no hay evidencia de soporte nativo.
- Agentes y razonamiento multi-paso: no disponible; sin datos de entrenamiento en reasoning ni modo "thinking".
- Capacidades multilingües: no disponible; no se declaran idiomas en la model card.
- Visión, audio u otras modalidades: no disponible; no consta ningún componente multimodal.
- Razonamiento matemático y código: no disponible; sin benchmarks ni datos de composición del corpus.

## Casos de uso

- Fine-tuning para clasificación de texto en dominio específico: con 742 millones de parámetros, el modelo es ajustable en una sola GPU consumer con cuantización o con técnicas de ajuste eficiente (LoRA/QLoRA), lo que permite adaptarlo a tareas de etiquetado sobre corpus propios.
- Base para experimentación académica en arquitecturas no estándar: la combinación de `fabric` y `custom_code` sugiere una implementación propia; resulta útil para investigadores que quieran estudiar o reproducir la arquitectura cargando el código del repositorio.
- Generación de texto con ajuste supervisado posterior: al no estar alineado por instrucciones, encaja en pipelines donde se controla el formato de salida mediante SFT sobre datos propios.
- Extracción de información estructurada: tras un fine-tuning específico, puede emplearse para convertir texto libre en campos estructurados (entidades, relaciones) en entornos con recursos limitados de GPU.
- Prototipado de asistentes de dominio cerrado: con un ajuste sobre un corpus vertical (normativa interna, documentación técnica), sirve para validar producto antes de escalar a modelos mayores.
- Despliegue en entornos con restricciones de memoria: 1,5 GB de pesos en safetensors permiten ejecución en GPU de 8 GB o incluso en CPU para inferencia por lotes no interactiva, siempre que se resuelva la dependencia de `custom_code`.
- Investigación sobre alineación y evaluación de modelos base: útil como referencia de modelos pequeños sin alinear para comparar comportamientos frente a variantes instruidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (fp32): aproximadamente 3 GB solo para pesos (742,5 M de parámetros × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 1,5 GB para pesos, más overhead; viable en GPUs de 8 GB con contexto moderado.
- VRAM estimada en int8: alrededor de 0,75 GB para pesos; en int4, en torno a 0,4 GB, aunque no se distribuyen pesos cuantizados oficialmente y habría que generarlos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4, A100 y H100 son sobradamente suficientes. Cabe en GPUs consumer de gama media-baja.
- Despliegue: no hay evidencia de soporte en vLLM, TGI, llama.cpp u Ollama; el flag `custom_code` obliga a cargar la implementación del repositorio con `trust_remote_code=True`. La conversión a GGUF requeriría portar el código a la arquitectura esperada por llama.cpp.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Bluebird-1.5-Base | 742,5 M | no disponible | no disponible | safetensors + custom_code | Hugging Face, 25 descargas |
| Qwen2.5-0.5B | 494 M | 32 768 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, ampliamente adoptado |
| Qwen2.5-1.5B | 1 540 M | 32 768 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, ampliamente adoptado |
| SmolLM2-1.7B | 1 711 M | 8 192 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, con model card completa |

La comparación es estructural: los modelos de referencia de la franja 0,5-1,7 B cuentan con licencia permisiva, contexto documentado, variantes cuantizadas y soporte en runtimes estándar. Bluebird-1.5-Base no ofrece, según la información disponible, ninguno de esos elementos, por lo que su adopción en producción requiere trabajo adicional de integración y verificación legal.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede asumir permiso de uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Ausencia de model card sustantiva: no hay información sobre datos de entrenamiento, sesgos, idiomas ni evaluación, lo que impide una due diligence técnica razonable.
- Riesgo elevado de alucinación: al ser un modelo base de 742 M sin alineación documentada, la generación libre no está calibrada para producir respuestas factuales.
- Dependencia de `custom_code`: la carga requiere ejecutar código del repositorio con `trust_remote_code=True`, lo que introduce un riesgo de seguridad y de reproducibilidad si el código cambia.
- Sin cuantizaciones oficiales: no hay GGUF ni GPTQ/AWQ publicados, lo que limita el despliegue en CPU y en GPUs de baja memoria sin trabajo previo de conversión.
- Idiomas no declarados: no se puede garantizar un rendimiento aceptable en castellano ni en ningún otro idioma concreto.
- Contexto desconocido: sin longitud de contexto publicada, el diseño de aplicaciones con prompts largos es especulativo.
- Madurez baja del proyecto: 25 descargas y 3 likes, sin paper ni repositorio de código independiente, implican un soporte comunitario prácticamente nulo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tudor-iustin22/Bluebird-1.5-Base
- Perfil del autor en Hugging Face: https://huggingface.co/tudor-iustin22/models
