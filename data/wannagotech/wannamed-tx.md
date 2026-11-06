# WannaGoTech/WannaMed-Tx

## Resumen

WannaMed Tx es un modelo de lenguaje especializado en el dominio médico y clínico, desarrollado por la empresa francesa WannaGoTech como componente textual de su barra de dictado médica WannaMedBar v2.0.0, junto al modelo de reconocimiento de voz WannaMed ASR v2. Con 4B de parámetros (3.880.263.168 parámetros lingüísticos puros), resuelve el problema de transformar dictados médicos libres en informes clínicos estructurados según plantillas XML, redactar conclusiones diagnósticas y corregir errores de homófonos típicos de los sistemas ASR en contexto quirúrgico y radiológico.

El modelo procede de una destilación sin pérdidas ("dékopulation chirurgicale", según el autor) a partir de WannaMed Seurat (4B), entrenado en pesos completos BF16 sobre 36.057 informes clínicos y radiológicos, 329 plantillas XML, 13.219 términos de Dragon Medical y 41.744 reglas médicas certificadas. Se distribuye en formato OpenVINO con cuantización INT8 simétrica sin pérdidas, orientado a despliegue eficiente en local.

Su relevancia actual radica en la escasez de modelos abiertos optimizados para el francés clínico: según los datos del autor, supera con holgura a referencias como OpenBioLLM-8B y BioMistral-7B en tareas de estructuración de informes y corrección terminológica francófona, con soporte adicional de inglés y árabe.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer para generación de texto, basado en WannaMed Seurat) |
| Parametros totales | 4B (3.880.263.168 parámetros lingüísticos puros) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (7,23 GB), OpenVINO INT8 simétrica sin pérdidas (3,66 GB) |
| Idiomas soportados | francés (principal), inglés, árabe |
| Licencia | other (licencia personalizada; solicitud vía contact@wannamed.com) |
| Formato de pesos | OpenVINO IR (INT8_SYM); repo de 7,8 GB; compatible con transformers |

## Arquitectura y entrenamiento

WannaMed Tx deriva de WannaMed Seurat (4B), un modelo fundamental médico entrenado en pesos completos BF16. El proceso descrito por el autor es una "dékopulation quirúrgica sin pérdidas" que conserva el rendimiento del modelo original tras la cuantización: la versión OpenVINO INT8 simétrica solo pierde 0,1 puntos en conformidad de plantillas XML (98,5 % a 98,4 %) y mantiene el F1 de corrección de homófonos en 99,6 % sin deriva.

Los datos de entrenamiento declarados incluyen 36.057 informes clínicos y radiológicos (con partición hold-out sin fuga de datos, según el autor), 329 plantillas XML de estructuración hospitalaria, 13.219 términos del vocabulario Dragon Medical One y 41.744 reglas médicas certificadas para desambiguación terminológica. El modelo incorpora un mecanismo de traza de razonamiento explícito en francés mediante el token `<unused94>thought`. No se ha publicado información sobre el número total de tokens de preentrenamiento, la composición detallada del corpus ni el uso de RLHF o DPO.

## Capacidades

- Estructuración de dictados libres en informes clínicos conforme a 329 plantillas XML hospitalarias (98,4-98,5 % de conformidad declarada).
- Redacción de conclusiones diagnósticas con integración de clasificaciones radiológicas: ACR BI-RADS, PI-RADS v2.1, LI-RADS, Bosniak, O-RADS y Fleischner (96,8 % ROUGE-L declarado).
- Corrección quirúrgica de homófonos médicos generados por ASR (p. ej. *iléon/ilion*, *foie/foi*, *parenchyme cérébral*, *fourreau dural*) con 99,6 % de F1 y sin alterar medidas milimétricas ni posologías.
- Asistente clínico de preguntas y respuestas y planes de acción en 12 especialidades médicas, con traza de razonamiento explícita en francés.
- Respuesta a QCM (test de opción múltiple) médicos francófonos: 84,2 % en FrenchMedMCQA.
- Generación de texto multilingüe en francés, inglés y árabe.
- Desambiguación terminológica sobre vocabulario Dragon Medical One (13.219 términos).
- No se ha documentado soporte de tool calling, function calling, visión ni audio (el audio se gestiona mediante el modelo complementario WannaMed ASR v2).

## Casos de uso

- Estructuración de informes radiológicos: el radiólogo dicta libremente y el modelo genera el informe con la plantilla XML hospitalaria correspondiente (entre las 329 disponibles), manteniendo intactas las medidas milimétricas.
- Postprocesado de ASR médico: corrección automática de homófonos y terminología clínica tras el reconocimiento de voz, con 99,6 % de F1 declarado sobre 41.744 reglas, ideal como capa de limpieza en pipelines de dictado.
- Generación de conclusiones diagnósticas: síntesis de la conclusión del informe aplicando clasificaciones normalizadas (BI-RADS, PI-RADS, LI-RADS, Bosniak, O-RADS, Fleischner) con 96,8 % de ROUGE-L.
- Barra de dictado médica en tiempo real: integración en WannaMedBar v2.0.0 como motor textual en OpenVINO INT8 (3,66 GB), ejecutable en local junto a WannaMed ASR v2.
- Asistente clínico multiespecialidad: resolución de dudas clínicas y elaboración de planes de acción validados en 12 especialidades, con razonamiento trazable en francés.
- Preparación de oposiciones y formación médica francófona: resolución de QCM tipo FrenchMedMCQA con 84,2 % de precisión declarada.
- Digitalización de documentación clínica en hospitales francófonos: conversión de notas dictadas en texto no estructurado a informes normados, reduciendo la carga administrativa del personal sanitario.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Dataset | Métrica | BF16 (7,23 GB) | OpenVINO INT8 (3,66 GB) | vs OpenBioLLM-8B | vs BioMistral-7B |
|---|---|---|---|---|---|---|
| Estructuración de informes (329 plantillas XML) | WannaMed-CR-Struct-FR (36.057 informes hold-out) | Conformidad XML (%) | 98,5 | 98,4 | +24,6 pts (73,9 %) | +30,1 pts (68,4 %) |
| Corrección de homófonos ASR quirúrgicos | WannaMed-Homophones-FR (41.744 reglas) | F1 (%) | 99,6 | 99,6 | +22,8 pts (76,8 %) | +27,5 pts (72,1 %) |
| Síntesis de conclusión diagnóstica y clasificaciones RADS | no disponible | ROUGE-L (%) | 96,8 | 96,7 | +21,7 pts (75,1 %) | +26,6 pts (70,2 %) |
| QCM médico francófono | FrenchMedMCQA | Accuracy (%) | 84,2 | 84,1 | +15,7 pts (68,5 %) | +20,0 pts (64,2 %) |
| Planes de acción clínicos, 12 especialidades | WannaMed-12-Specialties-FR | Validación (%) | 100 (12/12) | 100 (12/12) | no disponible | no disponible |

## Requisitos de hardware

- Versión BF16: aproximadamente 7,23 GB de pesos, lo que requiere en torno a 9-10 GB de VRAM para inferencia con margen de contexto.
- Versión OpenVINO INT8 simétrica: 3,66 GB de pesos, ejecutable en torno a 4-5 GB de VRAM o incluso en CPU (OpenVINO está optimizado para inferencia en CPU Intel).
- Consumer GPU: la versión INT8 debería caber en GPUs de 6-8 GB como la RTX 3060 o RTX 4060; la versión BF16 requiere GPUs de 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090).
- GPUs de datacenter: no se especifican recomendaciones oficiales; cualquier GPU con 8 GB de VRAM (A10, T4) sería suficiente para la versión INT8.
- Despliegue: OpenVINO Runtime (formato nativo del repo); librería transformers declarada como compatible; no se menciona soporte explícito de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el diseño está orientado a dictado en tiempo real dentro de WannaMedBar v2.0.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Conformidad estructuración FR | FrenchMedMCQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| WannaMed Tx | 4B | Médico-clínico francés (informes, ASR post) | 98,4-98,5 % (declarado) | 84,2 % (declarado) | other (bajo solicitud) | Pesos bajo solicitud de licencia |
| OpenBioLLM-8B | 8B | Médico general (inglés) | 73,9 % (según WannaGoTech) | 68,5 % (según WannaGoTech) | Abierta (Llama-based) | Pesos públicos en Hugging Face |
| BioMistral-7B | 7B | Médico general (FR/EN) | 68,4 % (según WannaGoTech) | 64,2 % (según WannaGoTech) | Abierta (Apache 2.0 sobre Mistral) | Pesos públicos en Hugging Face |

Nota: los valores de OpenBioLLM-8B y BioMistral-7B proceden de las comparativas publicadas por el propio autor de WannaMed Tx y no han sido verificados de forma independiente.

## Limitaciones y advertencias

- Los benchmarks proceden exclusivamente del autor del modelo y están marcados como no verificados; los conjuntos de evaluación (WannaMed-CR-Struct-FR, WannaMed-Homophones-FR) son propios y no estándar de la comunidad.
- El dato de 100 % de validación en planes de acción de 12 especialidades debe interpretarse con cautela: el dataset es propio del autor y la métrica de "validación" no está definida públicamente.
- Riesgo de alucinación no cuantificado: en dominio clínico, cualquier error en posologías o medidas puede tener consecuencias graves; el modelo está diseñado para no alterarlas, pero se recomienda siempre revisión humana.
- Licencia personalizada ("other"): los pesos requieren solicitud previa vía contact@wannamed.com; no está claro si se permite uso comercial sin acuerdo específico.
- Sesgos: no disponible; al estar entrenado sobre datos clínicos franceses, el rendimiento en otros contextos sanitarios o idiomas distintos del francés puede degradarse.
- Longitud de contexto no publicada: dificulta evaluar su idoneidad para informes muy largos o conversaciones multi-turno extensas.
- No hay documentación de tool calling ni de capacidades agénticas; no es adecuado como asistente generalista con herramientas.
- Descargas muy bajas (65) y comunidad mínima: escaso historial de uso en producción fuera del ecosistema WannaGoTech.

## Enlaces

- Ficha del modelo en Hugging Face: https://huggingface.co/WannaGoTech/WannaMed-Tx
- Demo interactiva (Space ZeroGPU): https://huggingface.co/spaces/WannaGoTech/WannaMed-Tx
- Modelo ASR complementario: https://huggingface.co/WannaGoTech/WannaMedASR
- Modelo base: https://huggingface.co/WannaGoTech/WannaMed-Seurat
- Dataset de benchmark ASR clínico: https://huggingface.co/datasets/WannaGoTech/WannaMedASR-French-Clinical-Benchmark
- Sitio oficial WannaMed: https://wannamed.com/asr/
- Contacto para licencia de pesos: contact@wannamed.com
- Empresa desarrolladora: https://wannago.tech
