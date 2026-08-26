# Synthyra/FastESMFold

## Resumen

Synthyra/FastESMFold es un modelo de predicción de estructura de proteínas basado en el checkpoint `facebook/esmfold_v1`, empaquetado con el runtime FastPLMs para su uso a través de Hugging Face Transformers. Desarrollado por Synthyra, este modelo acepta secuencias de aminoácidos sin procesar y devuelve tensores de estructura tridimensional junto con métricas de confianza como pLDDT y pTM. Su principal aportación es la integración optimizada con backends de atención modernos (sdpa, flex_attention) y una interfaz unificada para clasificación de secuencias y residuos, lo que facilita su adopción en pipelines de biología computacional.

Con 3.531.684.708 parámetros, el modelo mantiene la arquitectura original de ESMFold, un transformador con módulos de estructura que predice coordenadas atómicas directamente desde la secuencia. La licencia MIT permite uso comercial sin restricciones, y los pesos se distribuyen en formato safetensors. La relevancia actual radica en que ofrece una alternativa lista para producción al ESMFold original, con soporte para fine-tuning mediante PEFT (LoRA) y ejecución eficiente en hardware moderno, aunque el fabricante solo valida oficialmente el despliegue en NVIDIA GH200 sobre Linux aarch64.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESMFold (transformador + modulo de estructura) |
| Parametros totales | 3.531.684.708 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (secuencias de aminoacidos, sin limite especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biologico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de ESMFold, que combina un transformador de proteínas (basado en ESM-2) con un módulo de estructura que predice coordenadas 3D de los átomos pesados mediante un proceso iterativo de reciclaje. No se han publicado detalles específicos sobre el entrenamiento en la información disponible; se sabe que el checkpoint procede de `facebook/esmfold_v1`, entrenado con datos de secuencias y estructuras de PDB. La innovación de FastPLMs reside en la implementación del runtime: soporta tres backends de atención (`eager`, `sdpa`, `flex_attention`), permite ejecución en BF16 con parámetros en FP32 mediante autocast, y ofrece helpers para predicción de estructura y clasificación. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, ya que no es un modelo generativo de lenguaje.

## Capacidades

- Predicción de estructura 3D de proteínas: devuelve tensores de coordenadas, pLDDT (confianza por residuo) y pTM (confianza global).
- Generación de archivos PDB directamente desde una secuencia mediante `fold_protein()`.
- Clasificación de secuencias completas (etiqueta a nivel de proteína) con cabezas de clasificación recién inicializadas.
- Clasificación de residuos individuales (etiquetas por aminoácido) con máscara para posiciones no biológicas.
- Fine-tuning eficiente mediante PEFT (LoRA) sobre cualquier capa lineal.
- Soporte de atención con `sdpa` y `flex_attention` para reducir uso de memoria y acelerar inferencia.
- Ejecución en BF16 con autocast para mantener precisión en parámetros.

## Casos de uso

- Predicción de estructura para investigación académica: los investigadores pueden obtener modelos 3D de proteínas de interés sin necesidad de cristalografía, usando el método `infer()` o `fold_protein()` para generar archivos PDB con métricas de confianza.
- Diseño de proteínas de novo: el modelo permite evaluar rápidamente la viabilidad estructural de secuencias diseñadas, integrándose en bucles de diseño generativo.
- Anotación funcional de proteomas: mediante la clasificación de secuencias (cabezas de clasificación tras fine-tuning), se pueden asignar funciones putativas a proteínas desconocidas.
- Detección de dominios o regiones funcionales: la clasificación de tokens (residuos) permite identificar regiones conservadas o sitios activos tras entrenar la cabeza correspondiente.
- Integración en pipelines de biología estructural: gracias a la interfaz estándar de Transformers, se puede combinar con otras herramientas de análisis (por ejemplo, alineamiento estructural, docking) en flujos automatizados.
- Fine-tuning con LoRA para tareas específicas: laboratorios con datos propios (por ejemplo, termoestabilidad, actividad enzimática) pueden adaptar el modelo con pocos recursos computacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El fabricante declara como objetivo validado exclusivamente la NVIDIA GH200 en Linux aarch64. No se proporcionan requisitos de VRAM ni GPU alternativas certificadas.
- Con 3.531.684.708 parámetros, el modelo requiere al menos 14 GB de memoria en FP32 y aproximadamente 7 GB en BF16, por lo que es probable que quepa en GPUs de consumo con 16 GB o más (por ejemplo, RTX 4090), pero no hay garantía oficial.
- Para despliegue, se recomienda usar Transformers con `trust_remote_code=True` y seleccionar el backend de atención `sdpa` para un equilibrio entre velocidad y memoria.
- No se mencionan opciones de despliegue con vLLM, llama.cpp u Ollama; el modelo está pensado para el ecosistema Transformers.
- La latencia y el throughput dependen del hardware y de la longitud de la secuencia; no se ofrecen datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synthyra/FastESMFold | 3.53B | no especificado | no publicado | MIT | Hugging Face |
| facebook/esmfold_v1 | ~3.5B | no especificado | no publicado | MIT | Hugging Face |
| Synthyra/ESMFold2-Fast | no disponible | no disponible | no publicado | MIT | Hugging Face |

La comparativa directa con `facebook/esmfold_v1` muestra que FastESMFold es esencialmente el mismo checkpoint con un runtime optimizado, por lo que el rendimiento estructural debería ser idéntico. La diferencia radica en la integración con FastPLMs, que añade backends de atención eficientes y cabezas de clasificación. No se dispone de información suficiente para comparar con AlphaFold u otros modelos de predicción de estructura.

## Limitaciones y advertencias

- Las cabezas de clasificación de secuencia y token están recién inicializadas y no entrenadas; sus salidas no deben interpretarse como predicciones válidas sin fine-tuning previo.
- El fabricante solo valida el despliegue en NVIDIA GH200 sobre Linux aarch64; otros entornos (x86-64, CPU, Windows, macOS) no cuentan con evidencia de soporte.
- Se requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar código remoto; se recomienda auditar el repositorio antes de su uso en entornos sensibles.
- No se proporcionan límites explícitos de longitud de secuencia; secuencias muy largas podrían agotar la memoria incluso en GPUs de alta capacidad.
- El modelo no incluye soporte para ProteinTTT ni para acondicionamiento por pocket o distograma; estas funcionalidades se rechazan explícitamente.
- Aunque la licencia MIT permite uso comercial, el modelo no ha sido auditado para aplicaciones clínicas o de alto riesgo; las predicciones estructurales deben validarse experimentalmente.

## Enlaces

- [Hugging Face - Synthyra/FastESMFold](https://huggingface.co/Synthyra/FastESMFold)
- [Hugging Face - Synthyra/ESMFold2-Fast](https://huggingface.co/Synthyra/ESMFold2-Fast)
- [GitHub - Synthyra/FastPLMs](https://github.com/Synthyra/FastPLMs)
- [Documentacion de modelos FastPLMs](https://github.com/Synthyra/FastPLMs/blob/main/docs/models.md)
- [Sitio web de Synthyra](https://synthyra.com/)
