# veldierin/Artemis-31B-v1q-GGUF

## Resumen

Artemis-31B-v1q es un ajuste fino del modelo google/gemma-4-31B-it, desarrollado por Drummer con datasets propios de roleplay y distribuido por BeaverAI en formato GGUF cuantizado. Se trata de una build de propósito único: dedicar el peso completo del modelo a la generación de narrativa de rol, priorizando la consistencia de personaje y la calidad de escritura frente a benchmarks generalistas. El modelo conserva la arquitectura gemma4 y el template de chat original del base, lo que permite integrarlo directamente en lanzadores compatibles con la familia Gemma.

El repositorio contiene un único archivo GGUF en cuantización IQ4_XS de 15.59 GiB, lo que permite ejecutarlo en GPUs de consumidor con al menos 16 GB de VRAM. El modelo cuenta con 30.697.345.596 parámetros, heredados de la arquitectura del base Gemma 4. No se dispone de información sobre la longitud de contexto ni sobre la licencia del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (833 tensores) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ4_XS (imatrix); se menciona Q8_0 como soporte de cuantización, pero no se ofrece archivo en la tarjeta |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura gemma4, que utiliza 833 tensores, según la tarjeta de presentación. Se trata de un ajuste fino del modelo google/gemma-4-31B-it, entrenado por Drummer sobre un conjunto de datasets propios orientados al roleplay. No se han proporcionado detalles sobre el número de tokens de entrenamiento, la composición exacta de los datos ni si se emplearon técnicas de alineación como RLHF o DPO. La única innovación destacable es la conservación íntegra del template de chat del modelo base a través del proceso de cuantización, lo que facilita su uso en motores compatibles sin modificaciones.

## Capacidades

- Generación de texto narrativo de rol: mantiene la voz y la personalidad de personajes a lo largo de escenas largas.
- Preserva el template de chat de Gemma 4, por lo que se integra en lanzadores de la familia Gemma sin necesidad de adaptar el formato de prompts.
- Enfoque de propósito único: no incluye tool calling, soporte de agentes, visión ni procesamiento de audio.
- Capacidades multilingües: no disponibles en la información de la tarjeta.

## Casos de uso

- Juegos de rol por texto: el modelo actúa como narrador o personaje en aventuras interactivas, manteniendo coherencia en diálogos largos.
- Creación de personajes de ficción: generar fichas con historia, personalidad y patrones de habla para novelas o campañas.
- Novelas interactivas: utilizarlo como motor de historias donde el usuario decide acciones y el modelo responde desde la perspectiva del personaje.
- Simulación de diálogos para escritores: explorar la voz de un personaje antes de escribir diálogos definitivos.
- Bots de roleplay en comunidades: integrarlo en plataformas de chat como bots de personaje para foros o servidores de Discord.
- Generación de datos sintéticos de roleplay: producir conversaciones de rol para entrenar modelos más pequeños o evaluar la calidad de la narrativa generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El archivo GGUF IQ4_XS ocupa 15.59 GiB; para inferencia con contexto moderado se recomienda una GPU con al menos 16 GB de VRAM.
- GPU recomendadas: RTX 4080/4090 (16-24 GB), o GPUs profesionales como A100 (40 GB) o H100 (80 GB).
- Es posible ejecutarlo en CPU con 32 GB de RAM o más mediante llama.cpp, aunque la velocidad será significativamente menor.
- Despliegue: compatible con llama.cpp, Ollama y otros motores que carguen formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

En la información disponible no se especifican modelos comparables de la misma categoría. A continuación se muestra la comparativa con el modelo base, que es el único punto de referencia conocido:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| google/gemma-4-31B-it | 30.697.345.596 | No disponible | No disponible | HuggingFace |
| veldierin/Artemis-31B-v1q-GGUF | 30.697.345.596 | No disponible | No disponible | HuggingFace (GGUF) |

## Limitaciones y advertencias

- Sin datos de benchmarks públicos; el rendimiento en tareas generalistas no está validado.
- Licencia no disponible; se desconoce si permite uso comercial. Debe verificarse antes de usar en producción.
- Riesgo de alucinación inherente a modelos generativos; en roleplay puede producir contenido no deseado.
- Sesgos no documentados; el fine-tune en datasets de roleplay puede reflejar sesgos del autor.
- No soporta tool calling ni capacidades agénticas, por lo que no es adecuado para tareas automatizadas.
- Longitud de contexto no especificada; puede afectar a escenas muy largas.

## Enlaces

- https://huggingface.co/veldierin/Artemis-31B-v1q-GGUF
- https://huggingface.co/BeaverAI/Artemis-31B-v1q-GGUF
- https://huggingface.co/google/gemma-4-31B-it
