# zanezhang666/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF es una cuantización GGUF "abliterated" (con la dirección de rechazo eliminada) del modelo Qwen3.8-Flash-Next, publicada por el usuario zanezhang666 sobre las cuantizaciones oficiales GSQ-RCO de ISTA-DASLab. No se trata de un modelo entrenado desde cero, sino de una intervención quirúrgica sobre pesos ya cuantizados: se sustituyen 144 tensores de proyección de escritura al flujo residual, distribuidos en las 48 capas del modelo, por los equivalentes de una release abliterated ya existente, preservando intactos los valores y escalas aprendidos por GSQ y restaurando exactamente la asignación de tipos por tensor del modelo upstream.

El modelo base es un transformer de mezcla de expertos (MoE) con 176.943.899.520 parámetros totales, contexto declarado de 262K tokens y pipeline image-text-to-text, lo que indica capacidades multimodales de entrada imagen-texto. Está pensado para tareas de razonamiento, contexto largo y red-teaming, y se distribuye en formato GGUF para su uso con llama.cpp.

Su relevancia es doble: por un lado demuestra una técnica de "tensor transplant" sobre modelos ya cuantizados sin recalcular la cuantización; por otro, ofrece una variante sin censura de un modelo de gran tamaño con licencia Apache-2.0, lo que facilita su uso comercial y su experimentación en entornos de investigación de seguridad. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 217,9 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), 48 capas |
| Parámetros totales | 176.943.899.520 |
| Parámetros activos | no disponible |
| Longitud de contexto | 262K tokens (262.144) |
| Tipos de cuantización | IQ3_S, IQ3_XXS, IQ2_XS, Q2_0 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con 48 capas. El modelo original Qwen3.8-Flash-Next emplea cuantización aprendida GSQ (probablemente "Gradient-Scaled Quantization" o similar, no especificado en la información disponible) junto con una asignación de tipos por tensor con presupuesto restringido (RCO, "budget-constrained type assignment"). El pipeline image-text-to-text confirma que acepta imágenes además de texto, aunque no se detallan los componentes de visión ni el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO; todos estos datos figuran como no disponibles.

La innovación técnica de esta release concreta es el "tensor transplant": en lugar de reentrenar o recalcular la cuantización, se sustituyen 144 tensores de proyección de escritura al flujo residual en las 48 capas por los de una release abliterated ya preparada. Cada valor y escala GSQ se mantiene sin tocar, y se restaura exactamente la asignación de tipos por tensor del upstream. El autor indica que el build IQ3_S está verificado tensor a tensor con blake2b, de modo que solo cambiaron los tensores previstos. El coste de almacenamiento por nivel de cuantización es de solo 0,25–0,44 GB sobre el upstream, con rangos de 38,0 GB (Q2_0) a 55,1 GB (IQ3_S).

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento (reasoning) declarado en los tags.
- Procesamiento de entrada imagen-texto (pipeline image-text-to-text), aunque no se detalla la resolución ni el número de tokens visuales.
- Contexto largo de hasta 262K tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Uso en red-teaming y escenarios sin censura gracias a la eliminación de la dirección de rechazo (abliterated/uncensored).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio o visión avanzada más allá de image-text-to-text: no disponible.

## Casos de uso

- Investigación de seguridad y red-teaming: el modelo permite estudiar comportamientos sin las restricciones de rechazo habituales, útil para construir conjuntos de pruebas adversarios y evaluar la robustez de filtros de seguridad en pipelines propios.
- Análisis de documentos largos: con 262K tokens de contexto, se puede ingerir un informe completo o un repositorio de documentación y formular preguntas sobre él sin fragmentación.
- Procesamiento de documentación técnica con imágenes: al aceptar entrada image-text-to-text, sirve para extraer información de diagramas, capturas de pantalla o figuras junto con el texto que las acompaña.
- Atención al cliente automatizada en inglés o chino: conversaciones multi-turno con historial extenso gracias a la ventana de contexto, desplegable con llama.cpp en servidores con suficiente memoria.
- Generación y revisión de código en pipelines de CI/CD: aunque no se confirma tool calling, el modelo puede integrarse como generador de parches o revisor de diffs en flujos automatizados, siempre que se valide la salida.
- Experimentación con cuantización extrema: los niveles IQ2_XS y Q2_0 (38,0 GB) permiten probar el modelo en hardware más modesto y comparar la degradación frente a IQ3_S (55,1 GB).
- Despliegue local con llama.cpp: al ser GGUF, se puede ejecutar en estaciones de trabajo con GPU de gran memoria o en configuraciones CPU+GPU con offloading parcial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre 38,0 GB (Q2_0) y 55,1 GB (IQ3_S) solo para los pesos; hay que añadir la caché KV para 262K tokens, que puede ser muy elevada y depende de la configuración de llama.cpp.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para IQ3_S; para Q2_0, una RTX 4090 de 24 GB no basta por sí sola y requeriría offloading a CPU o varias GPU.
- ¿Cabe en GPU consumer? No de forma completa en ninguna GPU consumer actual de 24 GB; sí con offloading parcial a RAM del sistema.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y por extensión entornos compatibles con llama.cpp como Ollama o servidores basados en llama-cpp-python; vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF (este) | 176,9 B totales | 262K | Apache-2.0 | GGUF | Abliterated, cuantización GSQ-RCO preservada |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF (upstream) | 176,9 B totales | 262K | Apache-2.0 | GGUF | Sin abliterar; mismo layout de cuantización |
| Modelos comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de alternativas en la información proporcionada |

## Limitaciones y advertencias

- La eliminación de la dirección de rechazo puede degradar la coherencia en tareas que requieren negativas fundamentadas y aumenta el riesgo de contenido dañino; no es apta para producción orientada al público sin filtros adicionales.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran tamaño; no se han publicado evaluaciones de fidelidad.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Aunque la licencia es Apache-2.0, el modelo deriva de un upstream con su propia licencia y de una release abliterated de terceros; conviene revisar las condiciones de todas las fuentes antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-09), por lo que no hay evidencia comunitaria de calidad ni de estabilidad.
- La verificación blake2b solo se declara para el build IQ3_S; no se confirma para IQ3_XXS, IQ2_XS ni Q2_0.
- El contexto de 262K tokens implica un coste de memoria KV muy alto; en la práctica puede ser necesario reducirlo.
- No se documentan parámetros activos del MoE, por lo que no se puede estimar el coste computacional real por token.

## Enlaces

- Hugging Face: https://huggingface.co/zanezhang666/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Modelo base (upstream): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- README en chino simplificado: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF/blob/main/README.zh-CN.md
- Paper referenciado (arXiv:2604.18556): no disponible como enlace verificado en la información proporcionada
- Paper referenciado (arXiv:2605.00649): no disponible como enlace verificado en la información proporcionada
