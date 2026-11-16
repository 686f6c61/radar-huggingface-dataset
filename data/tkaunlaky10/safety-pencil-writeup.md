# tkaunlaky10/safety-pencil-writeup

## Resumen

Safety Pencil es un trabajo de investigación (write-up) presentado a la Lexsi AI Safety and Alignment Hackathon, Track 2b, por el autor tkaunlaky10. No se trata de un modelo entrenado en sí, sino de un estudio técnico sobre cómo un ajuste fino benigno en hindi daña la seguridad de un modelo alineado, y sobre un método de reparación en forma cerrada basado en curvatura. El repositorio de Hugging Face contiene únicamente el documento de investigación; el modelo reparado se publica por separado como `tkaunlaky10/safety-pencil-runA-wiseft-0.5`.

El modelo base estudiado es CohereLabs/tiny-aya-global, ajustado con LoRA sobre 4.000 instrucciones benignas en hindi. El trabajo mide la deriva de seguridad en inglés, hindi e hinglish, propone una reparación mediante un problema de autovalores generalizado entre la Fisher de la deriva de seguridad y la Fisher de la tarea, y compara el resultado con líneas base como WiSE-FT y RegMean. El resultado principal es honesto y negativo en parte: la reparación funciona en términos absolutos (reduce el cumplimiento dañino en inglés del 22,5 % al 7,4 % sin pérdida de tarea), pero no supera a la interpolación simple de pesos.

La relevancia actual del trabajo reside en su carácter pre-registrado y en su análisis de por qué los pronósticos de segundo orden fallan: la deriva real escala como (1−α)^0,72, no como (1−α)², lo que invalida las predicciones cuadráticas. Además, documenta un perfil multilingüe de deriva basado en la pérdida de discriminación entre peticiones dañinas e inofensivas, no en la pérdida de la capacidad de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el write-up estudia Tiny Aya Global, sin detallar su arquitectura interna) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) e hindi (hi); se evalua tambien hinglish |
| Licencia | MIT |
| Formato de pesos | No disponible (el repositorio solo contiene el write-up; el modelo reparado se publica aparte) |

## Arquitectura y entrenamiento

El trabajo no describe la arquitectura interna del modelo base (CohereLabs/tiny-aya-global). El objeto de estudio es el efecto de un ajuste fino con LoRA sobre 4.000 instrucciones benignas en hindi. La pérdida de tarea bajó de 2,14 a 1,78 nats por token, pero el cumplimiento dañino en inglés subió del 6,6 % al 22,5 %, el rechazo excesivo en inglés pasó del 13,5 % al 55,0 % y el rechazo aumentó en todos los idiomas. La conclusión del autor es que el modelo no dejó de rechazar, sino que perdió la capacidad de distinguir peticiones dañinas de inofensivas.

El método de reparación se basa en un problema de autovalores generalizado F_h v = λ H_t v, donde F_h es la Fisher de la deriva de seguridad en el modelo alineado y H_t es la Fisher de la tarea en el modelo ajustado. Cada autovalor representa daño de seguridad por unidad de coste de tarea. Los autovalores mayores localizan la seguridad (concentrada en las capas 32–35), la fórmula ½Σλc² pronostica la deriva y encoger cada coordenada de la actualización por μ/(λ+μ) minimiza exactamente deriva más μ veces el arrepentimiento de tarea, lo que equivale a una fusión ponderada por Fisher de los dos modelos. El cálculo se hace tratable con K-FAC y se demuestra invariancia exacta bajo el gauge de valor/salida de la atención con consultas agrupadas (KL de salida ≤ 2×10⁻⁹). El pronóstico falla (Spearman ρ = 0,17; 24–39 veces demasiado bajo en el checkpoint principal), y la reparación sin cota rompe el modelo; una región de confianza por módulo, añadida después del congelado del experimento, lo corrige manteniendo la invariancia exacta.

## Capacidades

- Generación de texto y razonamiento en inglés e hindi, heredadas del modelo base Tiny Aya Global.
- Evaluación de seguridad multilingüe: el trabajo mide cumplimiento dañino, rechazo excesivo y rechazo por idioma (inglés, hindi, hinglish).
- Localización de la seguridad en el modelo mediante mapas de apalancamiento basados en autovalores.
- Pronóstico de deriva de seguridad a partir únicamente de la actualización de pesos.
- Reparación en forma cerrada sin reentrenamiento, implementada como plugin de SafeTune.
- Pipeline reproducible: CuratorKIT → SafeTune → AuditKIT, con datos, adaptadores y resultados publicados.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Auditoría de seguridad tras ajuste fino: el pipeline CuratorKIT → SafeTune → AuditKIT permite medir el cumplimiento dañino y el rechazo excesivo antes y después de un ajuste fino con LoRA, por idioma, usando únicamente etiquetas de juez y hashes SHA-256 de las completaciones.
- Reparación de modelos alineados sin reentrenamiento: el plugin de SafeTune aplica la contracción μ/(λ+μ) en la base de autovectores del pencil (F_h, H_t) para reducir el cumplimiento dañino en inglés del 22,5 % al 7,4 % conservando la pérdida de tarea en hindi en 1,774 nats/token.
- Evaluación multilingüe de deriva: el perfil por idioma (inglés, hindi, hinglish) permite detectar si un ajuste fino en un idioma degrada la seguridad en otro, un escenario habitual al adaptar modelos a mercados locales.
- Investigación sobre curvatura y seguridad: el trabajo sirve como referencia metodológica para quien diseñe herramientas de seguridad de segundo orden, al documentar que la deriva real escala como (1−α)^0,72 y no como (1−α)², y que en respuestas con alta confianza la KL real puede superar su aproximación cuadrática en órdenes de magnitud.
- Comparación de líneas base de fusión de modelos: los resultados permiten elegir entre reparación por curvatura, WiSE-FT (α = 0,5), RegMean y Fisher diagonal según el equilibrio entre cumplimiento dañino, rechazo excesivo y deriva KL a igual coste de tarea.
- Formación y revisión metodológica: el carácter pre-registrado (siete predicciones antes de medir) y la documentación de desviaciones lo convierten en material útil para enseñar prácticas de evaluación rigurosas en seguridad de IA.

## Benchmarks y rendimiento

| Metrica | Modelo alineado | Tras ajuste fino benigno | Tras reparacion en forma cerrada | WiSE-FT α = 0,5 |
|---|---|---|---|---|
| Cumplimiento dañino en ingles (test, 485 prompts) | 6,6 % | 22,5 % | 7,4 % | 5,4 % |
| Rechazo excesivo en ingles | 13,5 % | 55,0 % | 31,5 % | 15,5 % |
| Perdida de tarea en hindi (nats/token) | 2,136 | 1,780 | 1,774 | No disponible |
| Deriva KL a igual coste de tarea | No disponible | No disponible | Peor que WiSE-FT, RegMean y Fisher diagonal | Mejor que la reparacion |
| Invariancia de gauge (KL de salida) | No disponible | No disponible | ≤ 2×10⁻⁹ | No disponible |
| Pronostico de deriva (Spearman ρ) | No disponible | No disponible | 0,17 (24–39× bajo en el checkpoint principal) | No disponible |

El cumplimiento dañino tras la reparación se compara con el modelo alineado con McNemar exacto y corrección de Holm, p ≈ 10⁻¹⁴. RegMean empata con la reparación en cumplimiento dañino. La reparación no supera a las líneas base simples.

## Requisitos de hardware

- No disponible: el write-up no publica requisitos de VRAM, GPU recomendadas ni latencia del modelo base ni del reparado.
- El cálculo de curvatura se realiza con K-FAC, lo que sugiere que el pipeline de reparación es viable en hardware de gama alta, pero no se especifican modelos de GPU ni memoria.
- El trabajo menciona pilotos en CPU para el análisis de confianza (§8), sin detallar el hardware.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.

## Comparativa con modelos similares

| Modelo / metodo | Parametros | Contexto | Cumplimiento dañino en ingles | Rechazo excesivo en ingles | Licencia |
|---|---|---|---|---|---|
| Safety Pencil (reparacion) | No disponible (base Tiny Aya Global) | No disponible | 7,4 % | 31,5 % | MIT |
| WiSE-FT α = 0,5 | No disponible (misma base) | No disponible | 5,4 % | 15,5 % | MIT |
| RegMean | No disponible (misma base) | No disponible | Empata con Safety Pencil | No disponible | MIT |
| Fisher diagonal | No disponible (misma base) | No disponible | No disponible | No disponible | MIT |

No se dispone de comparación con modelos de la misma categoría fuera de las líneas base del propio estudio. Los datos de parámetros, contexto y rendimiento de Tiny Aya Global no se detallan en la información proporcionada.

## Limitaciones y advertencias

- El pronóstico de deriva falla: Spearman ρ = 0,17 y valores 24–39 veces demasiado bajos en el checkpoint principal; la ley de escala real es (1−α)^0,72, no (1−α)².
- La reparación sin cota rompe el modelo porque autovectores casi paralelos la convierten en un proyector oblicuo con pasos de hasta 94 veces la actualización; la región de confianza por módulo se añadió después del congelado del experimento y se registra como desviación.
- La reparación no supera a líneas base simples: RegMean empata en cumplimiento dañino y WiSE-FT α = 0,5 iguala el cumplimiento dañino y reduce a la mitad el rechazo excesivo (15,5 % frente a 31,5 %); en deriva KL a igual coste de tarea, WiSE-FT, RegMean y Fisher diagonal superan a la reparación.
- El trabajo evalúa modelos con prompts dañinos (aya_redteaming) en inglés, hindi y hinglish; no se publican completaciones dañinas, solo etiquetas de juez y hashes SHA-256.
- La tarea de seguridad preservadora durante el ajuste fino (Track 2b #5) se planificó como P4, se descartó y se reporta como no realizada.
- Solo se cubren inglés, hindi y hinglish; no hay datos sobre otros idiomas.
- No se documentan sesgos específicos del modelo base ni tasas de alucinación.
- La licencia MIT permite uso comercial, pero el repositorio solo contiene el write-up; el modelo reparado se distribuye en un repositorio aparte cuya licencia debe verificarse.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB: es un artefacto de documentación, no un modelo desplegable.

## Enlaces

- Repositorio del write-up en Hugging Face: https://huggingface.co/tkaunlaky10/safety-pencil-writeup
- Modelo reparado: https://huggingface.co/tkaunlaky10/safety-pencil-runA-wiseft-0.5
- Código en GitHub: https://github.com/tkaunlaky10/safety-pencil
- Versión PDF del write-up: https://huggingface.co/tkaunlaky10/safety-pencil-writeup/blob/main/Safety_Pencil_WRITEUP.pdf
- Referencias arXiv citadas en la model card: arXiv:2310.03693, arXiv:2111.09832, arXiv:2212.09849, arXiv:2312.04339, arXiv:2109.01903, arXiv:1503.05671, arXiv:1806.03884, arXiv:2405.16833, arXiv:2402.11746, arXiv:2308.01263, arXiv:2512.16245, arXiv:2602.15799
