# Tanvir106/TokenCal-Q1-Research

## Resumen

TokenCal-Q1-Research es un repositorio de investigación publicado en Hugging Face por el usuario Tanvir106 que no contiene un modelo entrenado listo para uso, sino el código de reproducción y extensión del estudio *Tokenization Fragmentation and Predictive Reliability in Low-Resource LLMs: A Bengali-Centric Cross-Lingual Study*. El artefacto es un conjunto de adaptadores LoRA (librería `peft`) y scripts de entrenamiento/evaluación orientados a medir cómo la fragmentación de tokens en bengalí afecta a la fiabilidad predictiva (calibración) de modelos multilingües de gran escala.

El trabajo propone una matriz experimental de 54 ejecuciones de entrenamiento completo que combina tres backbones (Qwen2.5-1.5B-Instruct, Gemma 3 4B IT y Llama 3.2 3B Instruct) con hasta ocho variantes de función de pérdida (M0, M1, M2, M3, Focal, RDrop, Const, Shuffle) y tres semillas (42, 123, 456). La contribución técnica central es una familia de pérdidas que incorporan la divergencia Jensen-Shannon entre las distribuciones de respuesta en inglés y bengalí, ponderada por la diferencia de fertilidad de tokens entre ambos idiomas.

Es relevante para investigadores interesados en tokenización multilingüe, calibración y evaluación de modelos en lenguas de bajos recursos, pero conviene subrayar que, según la propia model card, el entrenamiento completo en CUDA, las descargas de datasets externos y la subida a Hugging Face no se han ejecutado en el entorno del autor. No es un modelo desplegable en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre backbones transformer: Qwen2.5-1.5B-Instruct, Gemma 3 4B IT, Llama 3.2 3B Instruct |
| Parámetros totales | No disponible (depende del backbone; 1,5B, 4B y 3B respectivamente) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada de cada backbone; la política de contexto no trunca prompts sobredimensionados) |
| Tipos de cuantización | QLoRA (entrenamiento con cuantización, según tags); cuantizaciones de inferencia no especificadas |
| Idiomas soportados | Bengalí e inglés (estudio bilingüe); evaluación multilingüe adicional en guyaratí, malayalam y télugu vía MILU |
| Licencia | `other` (no se detallan términos) |
| Formato de pesos | Adaptadores PEFT/LoRA; checkpoints con `trainer.pt` (optimizador, scheduler, RNG); safetensors no confirmado |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo desde cero: aplica adaptadores LoRA sobre tres backbones instruct preentrenados, con entrenamiento cuantizado (QLoRA) y un protocolo de evaluación de cuatro opciones (A/B/C/D) por puntuación de siguiente token. Las pérdidas M0 a M3 son incrementales: M0 es la entropía cruzada media inglés/bengalí sobre el token de respuesta de vocabulario completo; M1 añade un Brier normalizado de cuatro clases; M2 incorpora la divergencia Jensen-Shannon inglés-bengalí normalizada por ln 2; y M3 pondera esa divergencia por la diferencia de fertilidad de tokens entre idiomas, normalizada por percentiles 5 y 95 calculados solo sobre el conjunto de entrenamiento. Las variantes `Const` y `Shuffle` actúan como controles (pérdida JS no ponderada y pesos permutados), mientras que `Focal` (gamma=2) y `RDrop` (KL bidireccional entre dos pasadas) son adaptaciones al protocolo de cuatro opciones, no réplicas exactas de las publicaciones originales. Temperature Scaling se ajusta únicamente con predicciones de validación de M0, sin entrenamiento adicional.

Los datos de entrenamiento y evaluación son BEnQA (3.553 pares de entrenamiento, 762 de validación, 762 de test retenido), B-REASO (1.215 ejemplos de validación etiquetados, evaluación fuera de distribución en bengalí) y MILU (solo test: 6.636 en bengalí, 4.825 en guyaratí, 4.321 en malayalam, 7.304 en télugu). Cada backbone recalcula su propia fragmentación específica de tokenizador. El runner valida que cada etiqueta A/B/C/D ocupe un único token y falla en caso contrario, y el sistema de checkpoints permite reanudación con integridad verificada, incluyendo estado de optimizador, scheduler, escalador de gradiente y generadores RNG.

## Capacidades

- Entrenamiento y evaluación de adaptadores LoRA sobre tres familias de modelos instruct con protocolo de elección múltiple de cuatro opciones.
- Cálculo de métricas de calibración: Brier de cuatro clases normalizado, divergencia Jensen-Shannon entre distribuciones inglés-bengalí y Temperature Scaling sobre logits de validación.
- Medición de fragmentación de tokens específica por tokenizador y su relación con la fiabilidad predictiva.
- Evaluación fuera de distribución en bengalí (B-REASO) y multilingüe en cuatro lenguas índicas (MILU).
- Reanudación de entrenamiento tras fallo con checkpoints atómicos y verificación de integridad.
- Modos `preflight` (validación de forward/backward y recarga de estado), `benchmark` (rendimiento y VRAM pico) y `full` (tres épocas por combinación).
- Sincronización opcional de checkpoints, métricas y predicciones a un repositorio privado de Hugging Face (`SYNC_HF=checkpoints`).
- Suite de tests matemáticos en CPU (`pytest`) para validar las funciones de pérdida.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido más allá del backbone subyacente.

## Casos de uso

- Reproducción de un estudio académico sobre tokenización y calibración: el repositorio permite replicar las 54 ejecuciones con semillas fijas y comparar ganancias relativas dentro de cada backbone, controlando el efecto de la fragmentación en bengalí.
- Investigación en tokenizadores para lenguas de bajos recursos: sirve para cuantificar la diferencia de fertilidad de tokens inglés-bengalí y correlacionarla con la fiabilidad de las predicciones en tareas de elección múltiple.
- Desarrollo de funciones de pérdida sensibles al idioma: las variantes M1-M3 y los controles `Const`/`Shuffle` permiten aislar el efecto de la divergencia JS ponderada frente a una regularización genérica.
- Evaluación de calibración post-hoc: el módulo de Temperature Scaling ajustado solo en validación es reutilizable para estudiar la sobreconfianza de modelos instruct en lenguas no inglesas.
- Validación de pipelines de entrenamiento distribuido: el sistema de checkpoints con reanudación y verificación de integridad sirve como referencia para entornos con interrupciones frecuentes (Colab, Kaggle).
- Auditoría de protocolos de evaluación multilingüe: la integración de MILU como test puro y la prohibición explícita de ajustar sobre test ofrecen un marco para diseñar evaluaciones sin fuga de datos.
- Docencia y formación: la suite de tests en CPU y el modo `preflight` permiten validar conceptos de calibración y divergencia entre distribuciones sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el entrenamiento completo en CUDA no se ha ejecutado en el entorno del autor y advierte de no presentar resultados planificados como resultados completados. El modo `benchmark` del runner mide rendimiento de entrenamiento a corto plazo y VRAM pico, pero no contribuye a los resultados de precisión de la investigación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del backbone (Qwen2.5-1.5B, Llama 3.2 3B, Gemma 3 4B) y del adaptador LoRA cargado.
- VRAM para entrenamiento QLoRA: no cuantificada en la información disponible; el modo `benchmark` está diseñado precisamente para medirla por configuración.
- GPU recomendadas: no especificadas. El flujo está pensado para ejecutarse en Google Colab o Kaggle con runtime GPU y requiere CUDA para el entrenamiento completo.
- Compatibilidad con GPU de consumo: no confirmada; los backbones de 3B y 4B con QLoRA son candidatos razonables, pero no hay datos publicados de VRAM pico.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el artefacto es un repositorio de investigación con adaptadores PEFT, no un modelo servible directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / artefacto | Tipo | Backbones | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokenCal-Q1-Research | Repositorio de investigación con adaptadores LoRA | Qwen2.5-1.5B, Gemma 3 4B, Llama 3.2 3B | No disponible | `other` | Público en HF, sin descargas ni likes |
| Adaptadores LoRA estándar (p. ej. QLoRA original) | Técnica de ajuste | Cualquier backbone | Heredado del backbone | Según backbone | Ampliamente disponible |
| Modelos instruct multilingües índicos (p. ej. familia Sarvam, excluida del estudio) | Modelo completo | Propietario | No disponible | No disponible | No disponible |

No se dispone de información suficiente para establecer una comparación cuantitativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Los tres backbones no son idénticos en tamaño ni vocabulario de tokenizador; la model card exige comparar ganancias relativas dentro de cada backbone y no precisiones brutas sin ajustar.
- El entrenamiento completo en CUDA, las descargas de datasets externos y la subida a Hugging Face no se han ejecutado en el entorno del autor; los resultados deben considerarse pendientes de verificación.
- El repositorio se describe como privado en la model card, aunque la URL pública es accesible; el acceso a checkpoints con licencia restringida (Gemma, Llama) y a MILU requiere habilitación individual en Hugging Face.
- Los datasets originales no se redistribuyen; BEnQA debe reconstruirse desde el commit oficial de GitHub y B-REASO requiere el ZIP de resultados del autor.
- Riesgo de seguridad en la reanudación: `torch.load(weights_only=False)` contiene objetos pickle de Python; no deben cargarse checkpoints de fuentes no confiables.
- La licencia `other` no especifica términos de uso comercial; debe consultarse antes de cualquier aplicación productiva.
- No hay información sobre sesgos, tasas de alucinación ni cobertura más allá del bengalí, inglés, guyaratí, malayalam y télugu.
- El artefacto no es un modelo desplegable: es código de investigación con adaptadores; no debe presentarse como solución de producción.
- La política de contexto no trunca prompts sobredimensionados; si un dataset completo no cabe, debe revisarse la política antes de entrenar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tanvir106/TokenCal-Q1-Research
- Dataset MILU (acceso restringido): https://huggingface.co/datasets/ai4bharat/MILU
- BEnQA (repositorio oficial en GitHub, referenciado en la model card): no disponible la URL exacta en la información proporcionada
- Paper de referencia *Tokenization Fragmentation and Predictive Reliability in Low-Resource LLMs: A Bengali-Centric Cross-Lingual Study*: no disponible la URL en la información proporcionada
- Notebook `TokenCal_Q1_Notebook.ipynb` y suite `test_tokencal_q1.py`: incluidos en el repositorio, sin URL directa
