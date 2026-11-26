# UraionLabs/Uraion-Cyber-Preview-GGUF

## Resumen

Uraion Cyber Preview es un ajuste fino de tipo mezcla de expertos (MoE) desarrollado por Uraion Labs, orientado a tareas de seguridad informática y análisis de código. Se construye sobre la arquitectura Qwen3.5-35B-A3B de Alibaba, con aproximadamente 35 000 millones de parámetros totales y unos 3000 millones activos por token, distribuidos en 256 expertos de los que se enrutan 8 por token. El modelo incorpora atención híbrida lineal/completa y una ventana de contexto de 262 144 tokens.

La versión publicada en este repositorio es una exportación GGUF cuantizada en Q4_K_M (21,2 GB) pensada para ejecutarse en llama.cpp, con tokenizador y plantilla de chat originales sin modificar. El ajuste consistió en una ronda de entrenamiento de preferencias on-policy fusionada en los pesos base, sin cabezas de predicción next-N (se eliminaron en la exportación), lo que impide usar decodificación especulativa tipo MTP con este fichero.

Su relevancia actual radica en que ofrece un modelo de razonamiento con modo thinking y soporte de tool calling en un tamaño que cabe en una GPU de 96 GB y, con cuantizaciones más agresivas, potencialmente en hardware de consumo. No obstante, el propio autor lo etiqueta como preview: una sola ronda de entrenamiento, evidencia de benchmark con una única semilla y sin cualificación formal de release.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (atención lineal + atención completa), base Qwen3.5-35B-A3B |
| Parametros totales | 34 660 610 688 (~34,7B) |
| Parametros activos | ~3B por token (8 de 256 expertos enrutados) |
| Longitud de contexto | 262 144 tokens (límite arquitectónico; no verificado en este fichero a longitud máxima) |
| Tipos de cuantizacion | Q4_K_M (única publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero único con tokenizador y plantilla embebidos) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 256 expertos y enrutamiento de 8 por token, sobre el que se aplica atención híbrida que combina capas de atención lineal con capas de atención completa, lo que reduce el coste de memoria de la caché KV en contextos largos. La arquitectura, el tokenizador y la plantilla de chat provienen del checkpoint público Qwen/Qwen3.5-35B-A3B del equipo Qwen de Alibaba Group.

El ajuste fino consiste en una única ronda de entrenamiento de preferencias on-policy fusionada directamente en los pesos base. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni detalles del pipeline de RLHF/DPO más allá de esa ronda. La exportación GGUF se cuantizó una sola vez a Q4_K_M con cuatro hilos y sin matriz de importancia, y se eliminaron las cabezas de predicción next-N, por lo que no hay cabeza especulativa utilizable. La plantilla de chat embebida es la que activa el bloque ` thinking` y el formato de tool calling, y requiere el flag `--jinja` en llama.cpp.

## Capacidades

- Generación de texto y razonamiento en modo thinking, con separación entre razonamiento interno y respuesta final (verificado en un smoke test con tope de 32 tokens de razonamiento).
- Análisis y explicación de código, con orientación específica a seguridad (detección de vulnerabilidades, revisión de parches, análisis de pares de código vulnerable/corregido).
- Generación de código: resultados de HumanEval base del 95,1% y HumanEval+ del 90,2% medidos sobre este mismo fichero.
- Soporte de tool calling y formato de llamadas a herramientas a través de la plantilla de chat embebida.
- Razonamiento multi-paso orientado a agentes: el autor reporta para la versión V1.0 un 95,2% de episodios de agente multi-paso resueltos (381/400), aunque esa cifra no se ha medido sobre este fichero.
- Procesamiento de inteligencia de amenazas: 73,3% en el subconjunto MCQ de CTI medido sobre este fichero.
- Capacidades multilingües: no disponibles (no se documentan idiomas soportados).
- Visión: el modelo base incluye una torre de imagen, pero el autor indica explícitamente que no se ha probado, no se recomienda y esta ficha no la declara como capacidad disponible.

## Casos de uso

- Revisión de código en pipelines de CI/CD: el modelo puede analizar diffs y señalar patrones de vulnerabilidad antes del merge, aprovechando su entrenamiento en pares vulnerable/corregido (88,1% en PrimeVul filtrado sobre este fichero). Adecuado por su equilibrio entre tamaño (21,2 GB) y calidad en código.
- Triaje de alertas de seguridad: clasificación y explicación de hallazgos de escáneres, con contexto largo que permite incluir trazas, fragmentos de código y políticas en una sola ventana de hasta 262 144 tokens.
- Asistente de análisis de inteligencia de amenazas: respuesta a preguntas de opción múltiple sobre CTI (73,3% medido) y resumen de informes técnicos, integrándolo vía servidor compatible con OpenAI (`llama-server`).
- Agente de investigación multi-paso: encadenamiento de llamadas a herramientas (búsqueda, lectura de ficheros, ejecución de consultas) gracias al soporte de tool calling y al modo thinking, con la salvedad de que el rendimiento de agente no se ha medido en este fichero.
- Generación asistida de tests y parches: dado un fragmento de código, producir pruebas unitarias o parches candidatos, apoyándose en el 95,1% de HumanEval base y el 90,2% de HumanEval+.
- Despliegue local en estación de trabajo con GPU de 96 GB: servir el modelo con llama.cpp para uso interno de un equipo de seguridad, sin dependencia de APIs externas, gracias a la licencia MIT y al formato GGUF de fichero único.
- Formación y documentación interna: explicación didáctica de código legacy y de debilidades de seguridad, con la advertencia de que las explicaciones pueden ser plausibles pero incorrectas y requieren revisión humana.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre este mismo fichero Q4_K_M: 799 tareas primarias, una semilla (`public-final-0`), temperatura 1,0, top_p 0,95, top_k 20, tope de salida de 8192 tokens, tope de razonamiento de 1024 tokens, servido con llama.cpp en una GPU de 96 GB.

| Benchmark | Items | Este fichero (Q4_K_M) | Padre BF16 | Base sin entrenar |
|---|---:|---:|---:|---:|
| PrimeVul filtered pairs | 335 | 295 (88,1%) | 296 (88,4%) | 290 (86,6%) |
| CTI MCQ subset | 300 | 220 (73,3%) | 217 (72,3%) | 223 (74,3%) |
| HumanEval base | 164 | 156 (95,1%) | 156 (95,1%) | 157 (95,7%) |
| HumanEval+ | 164 | 148 (90,2%) | 147 (89,6%) | 148 (90,2%) |

El autor advierte que la comparación cambia simultáneamente backend (vLLM frente a llama.cpp) y precisión (BF16 frente a Q4_K_M), por lo que las diferencias no pueden atribuirse solo a la cuantización. No se han medido sobre este fichero IFEval ni BFCL; las cifras del padre (78,93% prompt-strict en IFEval y 89,75% en BFCL) no son transferibles.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M ocupa 21,2 GB; hay que presupuestar por encima de esa cifra para la caché KV, que crece con la longitud de contexto.
- GPU recomendadas: el autor validó el modelo en una GPU de 96 GB (clase A100/H100). No se ha probado en GPU de portátil ni en tarjetas de 24 GB.
- GPU de consumo: no verificado. Por tamaño de pesos, una RTX 4090 de 24 GB quedaría muy justa y sin margen para contexto; el autor no lo ha validado.
- Despliegue: llama.cpp (`llama-cli` para terminal, `llama-server` para servidor compatible con OpenAI en el puerto 8000). Requiere `--jinja` para usar la plantilla embebida.
- Comando de referencia: `llama-server -m Uraion-Cyber-Q4_K_M.gguf --jinja -c 32768 -ngl 99`.
- Decodificación especulativa: no habilitar draft/MTP; el fichero no tiene cabeza especulativa y los flags tipo `draft-mtp` fallarán o no harán nada útil.
- Latencia y throughput: no disponibles (no se publican cifras).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Uraion Cyber Preview (Q4_K_M) | ~34,7B totales / ~3B activos | 262 144 | MIT | GGUF | HumanEval+ 90,2%; PrimeVul 88,1% |
| Qwen3.5-35B-A3B (base) | ~35B totales / ~3B activos | no disponible | no disponible | safetensors | Checkpoint base del que deriva; sin ajuste de seguridad |
| Uraion Cyber V1.0 | no disponible | no disponible | no disponible | no disponible | Versión posterior del mismo autor; 90,2% de tareas de seguridad retenidas (1033/1145) |

No se dispone de datos suficientes en la información proporcionada para comparar con otras alternativas de la misma categoría (modelos MoE de ~35B orientados a código o seguridad) en parámetros, contexto y rendimiento de forma fiable.

## Limitaciones y advertencias

- Estado preview: una sola ronda de entrenamiento, evidencia de benchmark con una única semilla y sin cualificación de release.
- Cuantización 4-bit: pérdida de fidelidad general y especialmente acusada en tareas de cola larga; hay que validar sobre el caso de uso propio antes de depender del modelo.
- La salida en seguridad es un primer borrador: el modelo lee y explica código, pero no sustituye a un escáner, una auditoría ni un revisor humano, y puede explicar con seguridad código plausible pero incorrecto.
- Sin identidad aprendida: al ser un ajuste de un checkpoint público, no se identifica de forma fiable como "Uraion".
- Contexto: 262 144 tokens es el límite arquitectónico, no verificado en este fichero; el límite práctico vendrá antes por la memoria de la caché KV.
- Visión: la torre de imagen del modelo base no se ha probado y no se recomienda; esta ficha no declara entrada de imágenes.
- IFEval y BFCL no medidos sobre este fichero; no extrapolar las cifras del padre.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: reconocido explícitamente por el autor en el dominio de seguridad.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del checkpoint base Qwen subyacente antes de producción.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/UraionLabs/Uraion-Cyber-Preview-GGUF
- Modelo base BF16: https://huggingface.co/UraionLabs/Uraion-Cyber-Preview
- Versión V1.0: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0
- Licencia: https://huggingface.co/UraionLabs/Uraion-Cyber-Preview/blob/main/LICENSE
- Fichero Q4_K_M: https://huggingface.co/UraionLabs/Uraion-Cyber-Preview-GGUF/blob/main/Uraion-Cyber-Q4_K_M.gguf
- Sitio del autor: https://uraionlabs.com/
- Checkpoint base Qwen: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
