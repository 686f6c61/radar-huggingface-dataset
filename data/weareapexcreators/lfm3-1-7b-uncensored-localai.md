# weareapexcreators/LFM3-1.7B-Uncensored-LocalAI

## Resumen

LFM3-1.7B-Uncensored-LocalAI es una cuantización en formato GGUF del modelo LFM3 de 1.7B parámetros, publicada por el usuario weareapexcreators en Hugging Face. El repositorio pesa aproximadamente 1,1 GB y emplea cuantización con matriz de importancia (imatrix), una técnica que mejora la calidad de los modelos cuantizados de tamaño reducido. Según las etiquetas del repositorio, se trata de un modelo conversacional orientado a ejecución local sin filtros ("uncensored"), pensado para su uso en entornos de IA local.

La relevancia de esta ficha radica en la tendencia actual de adaptar modelos compactos (por debajo de 2B parámetros) para su ejecución en hardware de consumo, donde la cuantización GGUF permite inferencia en CPU o en GPUs modestas. El modelo base LFM3 corresponde a la familia Liquid Foundation Models de Liquid AI, una arquitectura híbrida que combina componentes de transformer con mecanismos alternativos a la atención estándar, aunque la model card original no aporta detalles técnicos específicos.

Es importante señalar que la documentación disponible es muy escasa: la model card se limita a declarar la licencia Apache 2.0, sin describir capacidades, entrenamiento ni benchmarks. Los datos técnicos que se recogen a continuación provienen principalmente de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM, arquitectura híbrida de Liquid AI) |
| Parametros totales | 1.728.801.600 (~1,73B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (calidades concretas no especificadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con endpoints estándar de inferencia local) |

## Arquitectura y entrenamiento

La familia LFM (Liquid Foundation Models) de Liquid AI se basa en arquitecturas híbridas que combinan capas de atención de transformer con unidades alternativas inspiradas en sistemas dinámicos (modelos de espacio de estados y convoluciones causales), lo que permite un equilibrio entre calidad de salida, throughput y uso de memoria. Sin embargo, la model card de esta cuantización no detalla la composición exacta de capas, el número de tokens de entrenamiento ni el proceso de post-entrenamiento del modelo base, por lo que estos datos no están disponibles.

Respecto a la cuantización, el repositorio emplea la técnica imatrix (matriz de importancia), que calcula estadísticas de activación sobre un corpus de calibración para asignar mayor precisión a los pesos más relevantes. Esto reduce la degradación típica de las cuantizaciones agresivas en modelos pequeños, donde cada bit de precisión tiene un impacto proporcionalmente mayor que en modelos grandes. El tamaño total del repositorio es de 1,1 GB, lo que sugiere cuantizaciones en el rango de 4-5 bits.

El sufijo "Uncensored" indica que el modelo base o la cuantización ha sido tratado para eliminar o reducir los rechazos de seguridad habituales en los modelos alineados. No hay documentación sobre el método concreto empleado (abliteración, fine-tuning sin filtros, etc.).

## Capacidades

- Generación de texto conversacional (etiquetado como "conversational" en el repositorio).
- Ejecución completamente local en CPU o GPU de consumo gracias al formato GGUF.
- Cuantización imatrix, que preserva mejor la calidad en tamaños comprimidos.
- Sin filtros de seguridad ("uncensored"), lo que permite respuestas sin rechazos de alineación.
- Compatibilidad con endpoints estándar de inferencia (etiqueta "endpoints_compatible").

No hay información disponible sobre capacidades de código, matemáticas, visión, tool calling, agentes ni soporte multilingüe.

## Casos de uso

- Chatbots locales privados: al ser un modelo de 1,7B cuantizado en GGUF (~1,1 GB), puede ejecutarse en portátiles sin GPU dedicada, manteniendo las conversaciones fuera de la nube, lo que resulta adecuado para datos sensibles.
- Prototipado rápido de agentes ligeros: su tamaño reducido permite orquestar múltiples instancias en paralelo en una sola máquina para tareas de clasificación, enrutado de intenciones o extracción de datos.
- Integración en aplicaciones de escritorio: el formato GGUF es compatible con llama.cpp y Ollama, lo que facilita embeber el modelo en aplicaciones con requisitos mínimos de memoria.
- Generación de texto creativo sin restricciones: el carácter "uncensored" lo orienta a casos de escritura creativa donde los modelos alineados rechazan contenido, siempre dentro del marco legal aplicable.
- Uso educativo y de experimentación: su bajo consumo de recursos lo hace idóneo para aprender sobre inferencia local, cuantización imatrix y ajuste de parámetros de muestreo sin coste de infraestructura.
- Sistemas embebidos y edge: con ~1,1 GB de pesos, puede desplegarse en dispositivos con memoria limitada (SBCs tipo Raspberry Pi 5 o mini PCs), aunque con latencias modestas.
- Resumen y reformulación de textos en flujos locales: tareas de transformación de texto de baja complejidad donde un modelo de 1,7B suele ser suficiente y la latencia importa más que la profundidad de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones en MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni comparativas con modelos de tamaño similar.

## Requisitos de hardware

- VRAM / memoria estimada: aproximadamente 1,1-1,5 GB para los pesos en GGUF (según la cuantización concreta), más overhead de contexto; el modelo puede ejecutarse íntegramente en RAM de CPU sin necesidad de GPU.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna con 2 GB de VRAM libres lo ejecuta con holgura (por ejemplo, GTX 1660, RTX 3060 o superiores).
- Consumer GPUs: cabe sin problemas en prácticamente cualquier GPU de consumo actual, e incluso en iGPUs con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, GPT4All, KoboldCpp y cualquier runtime compatible con GGUF (la etiqueta "endpoints_compatible" sugiere compatibilidad con servidores de inferencia estándar). No hay constancia de soporte directo en vLLM o TGI para esta cuantización GGUF.
- Latencia y throughput: no disponibles; en un modelo de 1,7B cuantizado, es razonable esperar velocidades superiores a 30-50 tokens/segundo en CPUs de escritorio modernas y cifras muy superiores en GPU, aunque son estimaciones no verificadas en la documentación.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Uncensored-LocalAI | ~1,73B | GGUF (imatrix) | Apache 2.0 | no disponible | Cuantización comunitaria sin filtros |
| Qwen2.5-1.5B-Instruct | 1,54B | Safetensors, GGUF | Apache 2.0 (algunas variantes) | 32.768 tokens | Fuerte en multilingüe y código, benchmarks publicados |
| Llama 3.2-1B-Instruct | 1,24B | Safetensors, GGUF | Llama 3.2 Community License | 128.000 tokens | Amplio ecosistema, licencia con restricciones |
| Gemma 2-2B-it | 2,61B | Safetensors, GGUF | Gemma Terms of Use | 8.192 tokens | Buena calidad conversacional, licencia restrictiva |

La principal ventaja diferencial de esta ficha frente a las alternativas es la combinación de licencia permisiva (Apache 2.0), formato GGUF listo para uso local y ausencia de filtros de alineación; su principal desventaja es la falta total de documentación y benchmarks verificables.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: la model card solo declara la licencia, por lo que no hay datos verificables sobre contexto, idiomas, capacidades ni calidad de salida.
- Etiqueta "uncensored": el modelo no aplica salvaguardas de seguridad, lo que implica riesgo de generar contenido ofensivo, ilegal o dañino; su uso es responsabilidad exclusiva del usuario y debe respetar la legislación vigente.
- Riesgo de alucinación elevado: los modelos de menos de 2B parámetros alucinan con frecuencia, especialmente en tareas de razonamiento y hechos específicos; no es adecuado para usos que exijan fiabilidad factual sin verificación externa.
- Sesgos: al tratarse de una versión sin filtros, los sesgos del entrenamiento no están mitigados por ajuste de alineación; no se dispone de análisis de sesgos publicados.
- Idiomas: no consta soporte de castellano ni de otros idiomas; debe verificarse empíricamente antes de usarlo en producción en castellano.
- Procedencia de la cuantización: publicada por un usuario individual (weareapexcreators) con 354 descargas y sin comunidad de revisión, por lo que se recomienda validar la integridad de los ficheros GGUF antes de su uso.
- Contexto: al no estar documentada la longitud de ventana, pueden producirse truncamientos inesperados en conversaciones largas.
- Licencia: Apache 2.0 permite uso comercial, pero debe comprobarse la licencia del modelo base LFM3 original, que podría tener condiciones propias no reflejadas en este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/weareapexcreators/LFM3-1.7B-Uncensored-LocalAI
- Paper, blog oficial, repositorio de origen del modelo base LFM3 y demos: no disponibles en la informacion proporcionada.
