# SZLHOLDINGS/MiniEmbed-Nano

## Resumen

MiniEmbed-Nano es un artefacto de embedding determinista publicado por SZL Holdings, una organización que se autodefine como infraestructura de IA gobernada para decisiones inspeccionables. A diferencia de los modelos de embedding convencionales como BGE o NV-Embed, MiniEmbed-Nano no es un modelo neuronal: se trata de una tabla de 64 filas por 12 columnas cuyas filas se generan como función de SHA-256, de modo que el vector resultante actúa como un "recibo" criptográfico del token de entrada. El modelo se puede re-derivar bit a bit a partir de una semilla fija (20260721) usando únicamente NumPy en CPU, sin ningún proceso de entrenamiento.

La relevancia de este artefacto reside en su enfoque de "provenance" (procedencia): en lugar de aprender representaciones semánticas mediante SGD, cada vector es una huella determinista del token, lo que permite verificar la integridad de la tabla y de las operaciones de recuperación. Está pensado para entornos de enseñanza y pruebas dentro del ecosistema "governed AI" de SZL Holdings, no como un reemplazo de los embeddings neuronales estándar. Su tamaño es mínimo (768 valores en total) y su licencia es Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tabla determinista de 64×12 generada por SHA-256 (no neuronal) |
| Parametros totales | 768 (64 filas × 12 columnas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (pesos en NumPy, sin cuantización) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | NumPy (archivos .npy) |

## Arquitectura y entrenamiento

MiniEmbed-Nano no sigue una arquitectura transformer, MoE ni SSM. Es una construcción matemática pura: cada fila de la tabla de 64×12 se obtiene aplicando SHA-256 al token correspondiente, y el vector final se calcula mediante mean-pooling de las filas L2 normalizadas, con una semilla fija (20260721) y ejecución en CPU con NumPy. No existe fase de entrenamiento, no hay SGD, no hay datos de entrenamiento ni ajuste por RLHF o DPO. La propia documentación del autor lo declara explícitamente: "No SGD theater" (sin teatro de SGD). La tabla es re-derivable bit a bit desde la semilla, lo que la convierte en un objeto verificable y auditable.

El modelo se enmarca dentro de la "Doctrine v11" de SZL Holdings, que incluye 749 declaraciones, 14 axiomas, 163 "sorries" (término usado en asistentes de prueba) y 8 teoremas probados con bloqueo. Esta doctrina parece ser un sistema formal de gobernanza para IA, y MiniEmbed-Nano es una pieza de demostración dentro de ese marco.

## Capacidades

- Generación de embeddings deterministas: produce un vector de 12 dimensiones por token, calculado mediante SHA-256 y mean-pooling.
- Verificación de procedencia: el vector actúa como recibo criptográfico del token, permitiendo comprobar que la representación corresponde exactamente a la entrada.
- Re-derivación bit-exacta: cualquier usuario puede reconstruir la tabla completa a partir de la semilla documentada, sin necesidad de pesos preentrenados.
- Recuperación por similitud coseno: la documentación menciona que la similitud coseno es una "afirmación sobre la tabla", lo que sugiere que se puede usar para comparar vectores, aunque con alcance limitado.
- Uso educativo: sirve para ilustrar conceptos de embeddings, hash y recuperación sin depender de redes neuronales.
- Integración en pipelines de "governed AI": al ser un objeto verificable, puede usarse en sistemas que requieren auditoría de decisiones.

No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües. No es un modelo de lenguaje.

## Casos de uso

- Enseñanza de embeddings y hash: en cursos de sistemas de recuperación o criptografía, MiniEmbed-Nano permite demostrar cómo un hash criptográfico puede generar representaciones vectoriales sin entrenamiento, y cómo se puede verificar la integridad de la tabla.
- Pruebas de integración en pipelines de IA gobernada: dado que el modelo es re-derivable y auditable, puede usarse como componente de prueba en sistemas que requieren trazabilidad de decisiones, por ejemplo, para verificar que un token concreto produce el vector esperado.
- Verificación de integridad de datos: en entornos donde se necesita un "recibo" de cada token procesado, el vector de 12 dimensiones puede servir como firma de procedencia, permitiendo detectar alteraciones en los datos de entrada.
- Experimentos de recuperación con similitud coseno: aunque limitado a 12 dimensiones, se puede usar para demostrar conceptos de búsqueda por similitud en un espacio de baja dimensionalidad, con fines didácticos.
- Auditoría de decisiones en sistemas de gobernanza: la documentación menciona "receipts" (recibos) y "proof boundaries" (límites de prueba); este embedding podría integrarse en flujos donde cada decisión deba dejar una traza verificable.
- Demostración de alternativas no neuronales: para investigadores que exploran representaciones sin aprendizaje, este artefacto muestra un enfoque radicalmente distinto, aunque no competitivo con BGE o NV-Embed.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona únicamente una métrica "Hit@2" evaluada sobre cinco pares de doctrina, calificada explícitamente como "SAMPLE" (muestra), sin valores numéricos. No hay comparaciones con otros modelos de embedding, y el propio autor advierte que no es comparable con BGE-base de 768 dimensiones. No se dispone de datos de latencia, throughput ni consumo energético.

## Requisitos de hardware

- CPU: cualquier procesador moderno es suficiente; la documentación especifica ejecución en CPU con NumPy.
- VRAM: 0 GB, no requiere GPU.
- RAM: menos de 1 MB para la tabla de 768 valores.
- GPU recomendadas: ninguna.
- Opciones de despliegue: NumPy puro, ejecutable en notebooks, scripts Python o entornos de pruebas. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: despreciable, al ser una operación de hash y pooling sobre una tabla diminuta.

## Comparativa con modelos similares

No disponible. El propio autor declara que MiniEmbed-Nano no es comparable con BGE-base (768 dimensiones) ni con NV-Embed, y que no existe un equivalente directo en el mercado. Es un artefacto único dentro del ecosistema de SZL Holdings, orientado a "provenance" y no a calidad de recuperación semántica. No se han encontrado modelos con características similares (embeddings deterministas basados en hash) en la información proporcionada.

## Limitaciones y advertencias

- No es un embedding neuronal: no aprende representaciones semánticas, por lo que su utilidad para recuperación de información real es prácticamente nula.
- No comparable con modelos estándar: la documentación advierte explícitamente que no es comparable con BGE-base de 768 dimensiones ni con NV-Embed.
- Métricas no fiables: el único resultado mencionado (Hit@2) se basa en cinco pares de doctrina, una muestra insignificante, y no se proporcionan valores numéricos.
- Sin datos de energía: la tabla de honestidad indica que las cifras de consumo energético no están disponibles a menos que un medidor firmado las certifique.
- Conjetura de unicidad abierta: la afirmación sobre la unicidad de la tabla (Λ) es una conjetura no demostrada, no un teorema.
- No es un modelo de propósito general: no genera texto, no razona, no procesa lenguaje natural.
- Restricciones de uso: aunque la licencia es Apache-2.0, el uso previsto se limita a enseñanza y pruebas; no está diseñado para producción.
- Fecha de creación futura: el modelo está fechado en agosto de 2026, lo que puede indicar que es un artefacto conceptual o experimental.

## Enlaces

- HuggingFace: https://huggingface.co/SZLHOLDINGS/MiniEmbed-Nano
- Perfil de SZL Holdings en HuggingFace: https://huggingface.co/SZLHOLDINGS
- Repositorio szl-atelier en GitHub: https://github.com/szl-holdings/szl-atelier
- Organización SZL Holdings en GitHub: https://github.com/szl-holdings
