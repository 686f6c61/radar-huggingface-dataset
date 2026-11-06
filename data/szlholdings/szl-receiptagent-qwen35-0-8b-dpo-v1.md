# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-dpo-v1

## Resumen

szl-receiptagent-qwen35-0.8b-dpo-v1 es un ajuste fino por DPO (Direct Preference Optimization) del modelo SFT SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, desarrollado por SZL Holdings. Se trata de un modelo especializado en el procesamiento de recibos y documentos de gasto (receiptagent), construido sobre una base de la familia Qwen 3.5 con aproximadamente 873 millones de parámetros. El objetivo declarado del ajuste es corregir una debilidad registrada de abstención: que el modelo reconozca cuándo no dispone de información suficiente en lugar de generar respuestas no fundamentadas.

El modelo se distribuye como un artefacto fusionado en 16 bits (modelo completo, no adaptadores LoRA), con licencia Apache 2.0 y pesos en formato safetensors listos para transformers. Su relevancia es acotada y experimental: se trata de una pasada piloto de DPO sobre 22 pares de preferencia sintéticos derivados de doctrina interna, no de un modelo de propósito general. La propia model card reconoce explícitamente que el ajuste demuestra la viabilidad de la etapa DPO del pipeline, pero no constituye evidencia de mejora en el comportamiento de abstención.

Por tanto, esta ficha debe leerse como la de un artefacto de investigación y validación de pipeline dentro del ecosistema gobernado de SZL Holdings, no como un modelo listo para producción. La información disponible sobre arquitectura interna, datos de entrenamiento y rendimiento es muy limitada, y muchos campos técnicos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 873.438.784 (según safetensors); la model card cita 865.765.440 en el contexto del entrenamiento |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la longitud de secuencia de entrenamiento fue 2048) |
| Tipos de cuantizacion | No disponible (artefacto publicado en 16 bits); al ser safetensors es cuantizable a posteriori con herramientas estándar (GGUF, bitsandbytes), aunque no se documenta |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (modelo completo fusionado en 16 bits) |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura transformer de la familia Qwen 3.5, según el tag `qwen3_5` de Hugging Face, con aproximadamente 873 millones de parámetros. No se dispone de información detallada sobre el número de capas, dimensión oculta, mecanismos de atención ni composición del corpus de preentrenamiento original. El modelo base inmediato es SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, un ajuste supervisado previo especializado en recibos.

El ajuste DPO se realizó sobre 22 pares de preferencia sintéticos derivados de doctrina interna (dataset doctrine-abstention-dpo-v1), con beta 0.1, learning rate 5e-6, una época y longitud de secuencia 2048. Se entrenaron 6.389.760 parámetros de 865.765.440 (0.74%), lo que sugiere un ajuste con adaptadores (LoRA) posteriormente fusionados en el artefacto final de 16 bits. El entrenamiento se ejecutó en una única RTX A6000 con el backend Unsloth. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, orientada a la interacción multi-turno.
- Procesamiento de imagen y texto (`image-text-to-text`): el pipeline declarado sugiere capacidad de recibir imágenes junto con texto, presumiblemente para la lectura de recibos, aunque no se detalla el alcance real de la visión.
- Extracción y razonamiento sobre documentos de gasto (recibos), según el nombre y propósito del modelo.
- Comportamiento de abstención objetivo: el ajuste DPO busca que el modelo decline responder cuando no dispone de evidencia suficiente, aunque no hay evaluación que lo confirme.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés declarado.

## Casos de uso

- Validación de pipelines de DPO: el modelo sirve como artefacto de referencia para verificar que la etapa de optimización por preferencias de un pipeline de ajuste funciona de extremo a extremo, dado que incluye logs de entrenamiento y script lanzador públicos.
- Extracción de datos de recibos en prototipos: con su naturaleza image-text-to-text, puede emplearse para experimentar con la lectura de campos de recibos (importe, fecha, comercio) en entornos de investigación, siempre con validación humana.
- Investigación sobre abstención: como caso de estudio de cómo se aborda la calibración de la abstención mediante DPO con datos sintéticos, útil para investigadores que diseñan sus propios conjuntos de preferencia.
- Pruebas de infraestructura de despliegue: por su tamaño reducido (menos de 1.000 millones de parámetros), es adecuado para validar pipelines de serving con transformers o vLLM en hardware modesto antes de escalar a modelos mayores.
- Docencia y demostraciones: su pequeño tamaño y licencia permisiva lo hacen útil para ilustrar el ciclo SFT → DPO en cursos o talleres.
- Evaluación comparativa de metodologías de preferencia: sirve como línea base frente a otros enfoques de alineación en experimentos controlados con datos sintéticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la mejora en abstención está pendiente de una evaluación independiente con conjunto de retención, por lo que no existe evidencia cuantitativa de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, en torno a 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior funciona sin problemas. Para entrenamiento, el autor empleó una RTX A6000.
- Cabe holgadamente en GPU de consumo: sí, en prácticamente todas las GPU modernas con 8 GB o más, e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (librería declarada); al ser safetensors, es convertible a GGUF para llama.cpp u Ollama, y desplegable con vLLM o TGI, aunque ninguna de estas rutas está documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| szl-receiptagent-qwen35-0.8b-dpo-v1 | ~873 M | No disponible | Apache 2.0 | Recibos + abstención (DPO piloto) | Hugging Face |
| Qwen2.5-0.5B / 1.5B Instruct | 0,5-1,5 B | 32.768 tokens (Qwen2.5) | Apache 2.0 | Propósito general | Hugging Face |
| SmolVLM-500M / 256M | 0,26-0,5 B | No disponible | Apache 2.0 | Visión-lenguaje | Hugging Face |

La comparación es aproximada: no se dispone de datos de rendimiento del modelo de SZL Holdings, y los alternativos citados son referencias de la misma escala de parámetros. La ventaja diferencial del modelo es su especialización declarada en recibos y abstención; su desventaja es la ausencia de evaluación pública y de documentación técnica detallada.

## Limitaciones y advertencias

- La mejora en abstención no está demostrada: la propia model card reconoce que el piloto de 22 pares no constituye evidencia de comportamiento mejorado y que la evaluación independiente está pendiente.
- Los datos de preferencia son sintéticos y derivados de doctrina interna, lo que puede introducir sesgos específicos de esa doctrina y no reflejar preferencias generales.
- Riesgo de alucinación inherente a los modelos de ~0,8 B, especialmente en tareas de extracción de documentos donde los campos pueden inventarse.
- Idiomas: solo inglés declarado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto no documentada; el entrenamiento usó secuencias de 2048 tokens, lo que limita la fiabilidad en documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación y la naturaleza experimental del artefacto desaconsejan su uso en producción sin validación propia.
- Sin descargas ni likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Capacidades de visión declaradas por el pipeline pero no documentadas en detalle; no deben asumirse funcionalidades OCR robustas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-dpo-v1
- Modelo base SFT: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Dataset de preferencias: https://huggingface.co/datasets/SZLHOLDINGS/doctrine-abstention-dpo-v1
- Logs de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/wave-logs
- Script de entrenamiento DPO: https://github.com/szl-holdings/szl-forge/blob/main/training/dpo_wave.py
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
