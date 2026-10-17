# UmutMal/TueAI2.51B

# UmutMal/TueAI2.51B

## Resumen
UmutMal/TueAI2.51B es un ajuste fino (fine-tuning) del modelo Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario UmutMal en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo derivado, no de un entrenamiento desde cero: hereda la arquitectura transformer decoder-only de Qwen2.5 y la adapta al turco, único idioma declarado en sus metadatos. El repositorio no incluye model card descriptiva más allá de la cabecera YAML con licencia, idioma y modelo base.

El interés del modelo reside en su tamaño reducido (la familia Qwen2.5-1.5B-Instruct ronda los 1.500 millones de parámetros), lo que permite despliegue en GPU de consumo y en CPU mediante cuantización. Sin embargo, el repositorio presenta cero descargas y cero valoraciones en el momento de redactar esta ficha, y no publica información sobre el dataset de ajuste, el número de tokens de entrenamiento, la metodología (SFT, DPO, LoRA) ni evaluaciones de ningún tipo.

Por tanto, esta ficha debe leerse como una descripción del linaje del modelo y de sus capacidades potenciales heredadas del modelo base, no como una validación empírica del ajuste. Cualquier uso en producción debería ir precedido de una evaluación propia sobre datos representativos del caso de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5); detalles del ajuste no disponibles |
| Parametros totales | No disponible. El modelo base Qwen2.5-1.5B-Instruct tiene 1.540 millones; el nombre del repositorio sugiere 2.510 millones, dato no confirmado por el autor |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El modelo base soporta 32.768 tokens nativos y hasta 131.072 con extension YaRN; se desconoce si el ajuste conserva estos valores |
| Tipos de cuantizacion | No disponible (no se publican ficheros GGUF, AWQ ni GPTQ en el repositorio) |
| Idiomas soportados | Turco (único idioma declarado en los metadatos). El modelo base es multilingüe (29 idiomas según Qwen) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (no confirmado; los repositorios de transformers suelen usar safetensors) |

## Arquitectura y entrenamiento
El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only con 28 capas, atención por consultas agrupadas (GQA) con 12 cabezas de consulta y 2 cabezas de clave/valor, activación SwiGLU, normalización RMSNorm, sesgo en las proyecciones QKV y embeddings RoPE. Su vocabulario es de 151.936 tokens y fue preentrenado sobre aproximadamente 18 billones de tokens según la documentación de Qwen2.5, seguido de un pipeline de ajuste por instrucciones y optimización por preferencias.

Sobre el ajuste concreto que da lugar a TueAI2.51B no hay ningún dato publicado: se desconoce el volumen de datos turcos empleados, la composición del dataset, si se aplicó LoRA o ajuste completo, si hubo fases de DPO o RLHF posteriores, y si se realizaron modificaciones de la longitud de contexto o del tokenizador. El README del repositorio se limita a la cabecera YAML con `license: apache-2.0`, `language: [tr]` y `base_model: Qwen/Qwen2.5-1.5B-Instruct`.

## Capacidades
Al no existir documentación de capacidades específica del ajuste, las siguientes se derivan del modelo base y deben verificarse empíricamente antes de usarse:

- Generación de texto y conversación multi-turno en turco (idioma objetivo del ajuste).
- Razonamiento básico, aritmética y resolución de problemas de nivel medio, capacidades presentes en Qwen2.5-1.5B-Instruct y limitadas por el tamaño del modelo.
- Generación y explicación de código en lenguajes habituales, así como instrucciones estructuradas.
- Soporte de tool calling y function calling, documentado en la familia Qwen2.5-Instruct; se desconoce si el ajuste lo preserva.
- Salida estructurada en JSON y seguimiento de plantillas de respuesta.
- Capacidades multilingües heredadas del modelo base, aunque el ajuste está declarado únicamente para turco.
- No hay evidencia de capacidades de visión, audio ni de un modo de razonamiento explícito (thinking mode).

## Casos de uso
- Asistente conversacional en turco para atención al cliente: el modelo puede gestionar diálogos multi-turno con contexto de hasta 32.768 tokens si conserva la ventana del modelo base, suficiente para hilos largos de soporte con histórico adjunto.
- Generación de borradores de correo y documentación interna en turco: adecuado para tareas de redacción asistida donde el coste por token es crítico y no se requiere razonamiento profundo.
- Clasificación y extracción de información sobre textos turcos: con salida en JSON, puede integrarse en pipelines de procesamiento documental para extraer campos, resumir tickets o etiquetar incidencias.
- Prototipado rápido en local: al partir de un modelo de ~1,5B, puede ejecutarse en una GPU de consumo con cuantización de 4 bits, lo que facilita ciclos de prueba sin coste de API.
- Generación de código en entornos de desarrollo con recursos limitados, como autocompletado o explicación de fragmentos, siempre que se valide la calidad del ajuste turco sobre instrucciones técnicas.
- Chatbot educativo o de práctica de idiomas: el modelo puede mantener conversaciones en turco y corregir texto, aunque la ausencia de evaluación hace necesaria una revisión humana de la calidad.
- Backend de agentes simples con tool calling: si el ajuste conserva la capacidad de invocación de funciones del modelo base, puede emplearse en flujos de automatización con dos o tres herramientas.
- Filtrado y moderación de contenido en turco: como clasificador auxiliar de bajo coste, siempre que se ajuste o se valide sobre datos propios.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, GSM8K, HumanEval ni de conjuntos de referencia en turco como TurkishMMLU o TR-MMLU, ni comparaciones con el modelo base.

## Requisitos de hardware
Estimaciones basadas en un modelo de aproximadamente 1.500 millones de parámetros; deben revalidarse si el recuento real del ajuste fuese superior:

- VRAM para inferencia en FP16/BF16: en torno a 3-4 GB de pesos, más el espacio de la caché KV (que crece de forma lineal con el contexto y el número de secuencias simultáneas).
- VRAM en cuantización de 8 bits: aproximadamente 2 GB de pesos. En cuantización de 4 bits: alrededor de 1-1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 2070 o superiores); A100, H100 o L40S para despliegues con muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más si se emplea cuantización; en 8 GB o más incluso sin cuantizar.
- Opciones de despliegue: al no publicarse ficheros GGUF ni cuantizaciones, la vía directa es transformers con safetensors; si se confirma la arquitectura Qwen2, puede convertirse a GGUF para llama.cpp u Ollama, o servirse con vLLM y TGI. No hay cuantizaciones oficiales listas para usar.
- Latencia y throughput: no disponibles. En una RTX 4090 con FP16 y vLLM cabría esperar latencias de decenas de milisegundos por token con decenas de peticiones concurrentes, pero es una estimación no verificada para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| UmutMal/TueAI2.51B | No disponible (base 1,5B) | No disponible (base 32.768) | Apache 2.0 | Repositorio HF sin descargas ni evaluaciones |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 nativo, 131.072 con YaRN | Apache 2.0 | Ampliamente usado, con documentación y benchmarks publicados |
| meta-llama/Llama-3.2-1B-Instruct | 1,23B | 128.000 | Llama 3.2 Community License | Muy extendido, requiere aceptar la licencia |
| google/gemma-2-2b-it | 2,6B | 8.192 | Gemma Terms of Use | Ampliamente usado, con benchmarks publicados |

El ajuste turco no publica métricas, por lo que no es posible afirmar que supere al modelo base ni a alternativas específicas para turco. La comparación debe entenderse como orientativa en cuanto a tamaño, contexto y licencia.

## Limitaciones y advertencias
- Ausencia total de evaluación: no hay benchmarks, ni comparación con el modelo base, ni descripción del dataset de ajuste, lo que impide estimar la ganancia real del fine-tuning.
- Riesgo de degradación catastrófica: un ajuste no documentado sobre un modelo pequeño puede deteriorar capacidades del modelo base (código, matemáticas, multilingüismo) fuera del dominio de ajuste.
- Riesgo de alucinación: inherente a los modelos de 1,5B de parámetros, especialmente en tareas de razonamiento largo o conocimiento factual en turco.
- Sesgos: no se documenta ningún proceso de mitigación de sesgos ni de alineación específico para el ajuste.
- Cobertura de idiomas: solo se declara turco; el comportamiento en castellano u otros idiomas no está garantizado y probablemente sea inferior al del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre citando la licencia y el aviso de copyright. Conviene verificar que el modelo base Qwen2.5-1.5B-Instruct (también Apache 2.0) no imponga condiciones adicionales.
- Señales de escasa madurez del repositorio: cero descargas, cero valoraciones y una fecha de creación registrada como 16 de octubre de 2026, lo que sugiere metadatos poco fiables o un repositorio de prueba.
- Reproducibilidad: sin semilla, hiperparámetros ni dataset publicados, los resultados no son reproducibles.
- Para producción, se recomienda validar el modelo contra el Qwen2.5-1.5B-Instruct original y contra otros ajustes turcos con evaluación publicada antes de adoptarlo.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/UmutMal/TueAI2.51B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- No se han encontrado otros enlaces (papers, demos o blogs) en la informacion proporcionada.
