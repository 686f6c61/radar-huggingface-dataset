# SubMaroon/Dark-Goetia-26B-A4B-LoRA-v4-GGUF

## Resumen

Dark-Goetia-26B-A4B-LoRA-v4-GGUF es un adaptador LoRA desarrollado por SubMaroon que se aplica sobre el modelo base Naphula/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA, un modelo de arquitectura MoE con 26.000 millones de parámetros totales y 4.000 millones activos por token. El adaptador está diseñado para roleplay bilingüe (inglés y ruso) en entornos como SillyTavern, y aporta un tono narrativo más oscuro y literario a las respuestas del modelo, sin introducir tramas ni personajes propios en los datos de entrenamiento.

La relevancia de esta versión v4 radica en que corrige un fallo detectado en la v2: en sesiones largas (30-40 turnos), el modelo dejaba de obedecer el formato de salida indicado en el system prompt. La v4 entrena el mismo conjunto de 115 proyecciones de atención con rank 32 y alpha 64, pero con un dataset que varía el formato de salida en ocho ejes distintos mientras mantiene fijo el estilo de prosa, forzando al modelo a aprender que el formato es una variable que debe leerse de la prompt y no una constante asociada al estilo.

El adaptador se distribuye en formato GGUF (tamaño de repositorio 0,1 GB) y está pensado para cargarse junto al modelo base en herramientas compatibles con la librería peft. La licencia es gemma, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA (MoE) |
| Parametros totales | 22.998.560 (adaptador) / 26.000.000.000 (modelo base) |
| Parametros activos | 4.000.000.000 (modelo base, MoE) |
| Longitud de contexto | 3584 (secuencia maxima de entrenamiento del adaptador) |
| Tipos de cuantizacion | GGUF (sin especificar precisiones concretas) |
| Idiomas soportados | en, ru |
| Licencia | gemma |
| Formato de pesos | GGUF (adaptador) / safetensors (adaptador original) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre las 115 proyecciones de atención del modelo base (o_proj, q_proj, v_proj, k_proj) con rank 32 y alpha 64, lo que produce un delta ΔW = (B·A)·(alpha/r) con una norma de Frobenius total de 2,440 en la v2. La distribucion de la influencia se reparte aproximadamente en un 61% en la rama OV (o_proj y v_proj) y un 39% en la rama QK (q_proj y k_proj), siendo la rama OV la que carga casi todo el estilo narrativo y la que contribuye en mayor medida a la degradacion del formato en sesiones largas.

El entrenamiento de la v4 usa una secuencia maxima de 3584 tokens (frente a los 2048 de la v2) y una sola epoca. La novedad clave esta en los datos: se incluyen escenas sinteticas reescritas de libros y escenas recien generadas, ademas de conjuntos externos de roleplay como LimaRP y Bluemoon (ShareGPT). El dataset varia el formato de salida en ocho ejes distintos mientras mantiene fijo el estilo de prosa, con una division de evaluacion estratificada que toma aproximadamente un 5% de cada grupo de system prompt, en lugar de una muestra agrupada como en la v2. El equilibrio de idiomas es probablemente igualitario entre ingles y ruso.

## Capacidades

- Roleplay bilingue en ingles y ruso con tono narrativo oscuro y literario.
- Ajuste de estilo y estructura de respuesta para Dark Fantasy RP.
- Soporte de formato estructurado en tarjetas de personaje (bloques nombrados, trackers de estado, etc.).
- Compatible con SillyTavern y preset Marinara.
- Escalado de intensidad controlable mediante el parametro de escala del adaptador (0.1 a 0.55+).
- No incluye tramas ni personajes predefinidos, por lo que no impone contenido narrativo.
- Capacidad de mantener la obediencia del formato durante sesiones largas (mejora frente a v2).

## Casos de uso

- **Roleplay de fantasia oscura en SillyTavern**: el adaptador se carga como LoRA sobre el modelo base y se usa con tarjetas de personaje de 2000+ tokens. Con una escala de 0.3 a 0.55 en prosa libre, el modelo mantiene un tono literario estable y controlado sin que el estilo domine la narrativa.
- **Sesiones de roleplay bilingue**: el adaptador admite tanto inglese como ruso, y es adecuado para grupos que alternan idiomas. La escala debe ajustarse al umbral ruso (0.37 en v2) si se alterna, ya que el ruso es mas fragil que el ingles.
- **Escritura creativa asistida**: se puede usar para generar narrativa de terror o fantasia con un tono mas oscuro y elaborado, ajustando la escala entre 0.2 y 0.3 para una influencia sutil o por encima de 0.55 para un estilo dominante.
- **Ajuste de formato en tarjetas de personaje estrictas**: para tarjetas que requieren bloques de salida estructurados (status, inventario, etc.), se recomienda una escala maxima de 0.40 en inglese y 0.37 en ruso (medidas en v2), manteniendo la integridad del formato a lo largo de decenas de turnos.
- **Pruebas de robustez de formato**: la v4 esta disenada para que el modelo aprenda a leer el formato de la prompt, por lo que puede usarse para evaluar la adherencia a instrucciones de formato complejas en contextos de conversacion larga.
- **Merging con otros adaptadores**: el delta de pesos se documenta con normas de Frobenius por proyeccion, lo que permite integrar el adaptador con otros LoRA o realizar ajustes de fusion controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona metricas internas de la magnitud de los pesos del adaptador (normas de Frobenius) y de la degradacion del formato en funcion de la escala, pero no hay datos de rendimiento estandarizados.

## Requisitos de hardware

- El adaptador LoRA es extremadamente ligero: 22.998.560 parametros y 0.1 GB en disco. Se puede cargar en cualquier sistema con CPU o GPU.
- El modelo base Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA es un MoE de 26B parametros, con un requisito de VRAM estimado en torno a 51,6 GB en precision completa (segun LLM Explorer).
- En modo cuantizado (GGUF), se puede reducir la VRAM necesaria a unos 15-20 GB con cuantizacion Q4_K_M, lo que permite su ejecucion en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), o en servidores con A100/H100.
- Para inferencia con el adaptador, se recomienda usar llama.cpp o SillyTavern con backend de llama.cpp, ya que el formato GGUF del adaptador se integra directamente.
- La latencia de inferencia en un MoE de 26B con 4B activos es baja para la clase de modelo, pero dependera del hardware; en una RTX 4090 se puede esperar un throughput de 30-50 tokens/s con cuantizacion Q4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Dark-Goetia-26B-A4B-LoRA-v4 | 22.98M (adaptador) | 3584 | gemma | Roleplay oscuro bilingue |
| Dark-Goetia-26B-A4B-LoRA-v2 | 22.98M (adaptador) | 2048 | gemma | Roleplay oscuro bilingue |
| 26B-Suite/Dark-Goetia-26B-A4B-v2 | 26B (MoE) | no disponible | gemma | Modelo base para roleplay |

La comparativa se limita a las versiones del mismo adaptador y al modelo base, ya que no se dispone de informacion sobre adaptadores equivalentes de otros autores. La v4 mejora la v2 en la robustez del formato en sesiones largas, amplia la longitud de secuencia de 2048 a 3584 y equilibra los idiomas inglese y ruso, a costa de una unica epoca de entrenamiento frente a las dos de la v2.

## Limitaciones y advertencias

- **Requisito de modelo base**: el adaptador no es funcional por si solo; requiere el modelo Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA para producir texto.
- **Sesiones largas**: aunque la v4 mejora la obediencia del formato, el fallo de degradacion puede aparecer en sesiones de mas de 30-40 turnos, especialmente con tarjetas de formato estricto y en ruso.
- **Dependencia del escalado**: la intensidad del efecto depende de la escala del adaptador; si el cargador no respeta la metadada alpha/r (que duplica la escala), los valores recomendados se deben reducir a la mitad.
- **Alucinacion**: como adaptador de estilo, no introduce contenido narrativo propio, pero el modelo base puede alucinar personajes o tramas no presentes en la tarjeta de personaje.
- **Idiomas**: solo soporta inglese y ruso; no se ha evaluado el comportamiento en otros idiomas.
- **Licencia gemma**: hereda la licencia del modelo base, que puede restringir el uso comercial o la redistribucion segun los terminos de Gemma.
- **Falta de benchmarks**: no hay resultados estandarizados de calidad de generacion, por lo que la evaluacion es subjetiva y basada en el uso practico en roleplay.

## Enlaces

- [SubMaroon/Dark-Goetia-26B-A4B-LoRA-v4-GGUF](https://huggingface.co/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v4-GGUF)
- [SubMaroon/Dark-Goetia-26B-A4B-LoRA-v2](https://huggingface.co/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v2)
- [SubMaroon/Dark-Goetia-26B-A4B-LoRA-v2-GGUF](https://huggingface.co/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v2-GGUF)
- [Naphula/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA](https://huggingface.co/Naphula/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA)
- [LLM Explorer: Dark Goetia 26B A4B LoRA V2](https://llm-explorer.com/model/SubMaroon%2FDark-Goetia-26B-A4B-LoRA-v2,4ekrYZWjvsBUTeXPftIklg)
- [LLM Explorer: Dark Goetia 26B A4B V2 (modelo completo)](https://llm-explorer.com/model/26B-Suite%2FDark-Goetia-26B-A4B-v2,4jKrd0ESJ6M9VrfeTcDy93)
- [FriendliAI: API para Dark-Goetia-26B-A4B-LoRA-v2](https://friendli.ai/models/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v2)
