# stases/orbitol

## Resumen

Orbitol es un modelo de difusión basado en transformer diseñado para la generación de estructuras cristalinas con un grupo espacial predefinido. Lo desarrollan Ivan Žugec, Joshua Rosenthal, Ivor Lončarić, Jan-Willem van de Meent y Tin Hadži Veljković, y se publica junto al artículo "Orbitol: Crystal Generation on Wyckoff Orbits" (arXiv:2610.30086). El modelo aborda un problema central en ciencia de materiales computacional: generar candidatos cristalinos válidos y simétricamente consistentes sin recurrir a búsquedas exhaustivas en el espacio de estructuras.

La innovación principal es la representación de cada cristal mediante sus órbitas de Wyckoff, lo que impone la simetría del grupo espacial de forma explícita durante el proceso de difusión en lugar de corregirla a posteriori. El repositorio publicado contiene únicamente los pesos EMA del modelo Orbitol-X entrenado sobre MP-20 hasta el paso 1.500.000 de un calendario de 2,5 millones, junto con tablas de Wyckoff, tokens procesados, cachés de órbitas y un relajador NequIP-OAM-L.

El bundle tiene un tamaño de 0,4 GB y se distribuye con licencia CC BY 4.0 para pesos y datos, mientras que el código asociado es MIT. No se proporcionan datos de benchmarks, idiomas ni pipeline en la información disponible, por lo que esta ficha se limita a lo documentado en la model card y el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer sobre orbitas de Wyckoff |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `.pt` sin cuantizar) |
| Idiomas soportados | no disponible (modelo cientifico, no linguistico) |
| Licencia | CC BY 4.0 (pesos y datos); codigo MIT |
| Formato de pesos | PyTorch (`.pt`), pesos EMA unicamente |

## Arquitectura y entrenamiento

Orbitol es un diffusion transformer que opera sobre una representación basada en órbitas de Wyckoff. En lugar de generar coordenadas atómicas libres y validar la simetría después, el modelo condiciona la generación al grupo espacial objetivo y describe cada estructura mediante las órbitas que ocupan sus posiciones, lo que garantiza consistencia simétrica por construcción. El checkpoint publicado corresponde a Orbitol-X entrenado sobre el conjunto MP-20 (Materials Project), con un calendario de 2,5 millones de pasos del que se libera el paso 1.500.000.

El bundle incluye tablas de Wyckoff generadas con PyXtal y spglib, tokens de entrenamiento y validación procesados, cachés de órbitas y una referencia de simetría. También incorpora un relajador NequIP-OAM-L 0.1 en TorchScript junto con OpenEquivariance compilado para compute capability 8.9 (Ampere y Ada), con instrucciones para recompilar en otras arquitecturas como Turing mediante `tools/build_nequip.py`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; el repositorio indica que los conjuntos de test procesados y los modelos Alex-MP-20, Orbitol-I y de control no se incluyen.

## Capacidades

- Generación de estructuras cristalinas condicionada a un grupo espacial concreto.
- Representación de cristales mediante órbitas de Wyckoff, con simetría impuesta durante la difusión.
- Muestreo por difusión con configuraciones de sampler incluidas en `configs/paper/`.
- Relajación de estructuras generadas mediante el relajador NequIP-OAM-L 0.1 incluido en el bundle.
- Reproducción de resultados del artículo mediante las recetas de `docs/reproduce.md`.
- Verificación de integridad del bundle mediante `MANIFEST.json` y `SHA256SUMS`.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Descubrimiento de materiales: generar candidatos cristalinos en un grupo espacial de interés (por ejemplo, para una familia estructural concreta) y filtrarlos posteriormente con cálculos DFT o con el relajador incluido.
- Aumento de datasets de materiales: producir estructuras sintéticas simétricamente válidas para ampliar conjuntos de entrenamiento de modelos de propiedades o de potenciales interatómicos.
- Exploración de polimorfos: muestrear estructuras alternativas dentro de un mismo grupo espacial para estudiar estabilidad relativa tras relajación con NequIP-OAM-L.
- Reproducción y evaluación de investigación: replicar los resultados del artículo usando las configuraciones de `configs/paper/` y los tokens de validación de MP-20 incluidos en el bundle.
- Generación condicionada en pipelines de cribado: integrar el sampler en flujos que combinen generación, relajación y cálculo de energía de hull para priorizar candidatos.
- Estudio metodológico de difusión con simetría: usar el modelo como referencia para comparar representaciones basadas en órbitas de Wyckoff frente a enfoques que corrigen simetría a posteriori.
- Docencia e investigación en ciencia de materiales computacional: emplear el bundle con verificación SHA-256 para prácticas reproducibles sobre generación cristalina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `configs/paper/models.json` para los resultados esperados y a `docs/reproduce.md` para las instrucciones de reproducción, pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo (0,4 GB) incluye pesos, datos y relajador, pero no se desglosa el tamaño del checkpoint.
- GPU recomendadas: el relajador OpenEquivariance incluido está compilado para compute capability 8.9, es decir, GPUs Ampere y Ada (por ejemplo, A100, RTX 3090, RTX 4090, L40S).
- Para GPUs Turing u otras arquitecturas es necesario recompilar el relajador con `tools/build_nequip.py`.
- No se documenta si el diffusion transformer cabe en GPU de consumo; el tamaño del checkpoint no se especifica.
- Opciones de despliegue: inferencia vía PyTorch con el código del repositorio (MIT); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de generación cristalina ni datos de rendimiento que permitan establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El checkpoint liberado corresponde al paso 1.500.000 de un calendario de 2,5 millones; no es el modelo final del artículo.
- Solo se publican pesos EMA; no hay estado del optimizador ni del entrenador, lo que impide reanudar el entrenamiento.
- No se incluyen los modelos Alex-MP-20, Orbitol-I ni los modelos de control, ni los splits de test procesados, lo que limita la reproducibilidad completa sin descargar datos públicos adicionales.
- El relajador OpenEquivariance está compilado solo para compute capability 8.9; en otras GPUs requiere recompilación.
- Los pesos y datos se distribuyen bajo CC BY 4.0, pero las estructuras y el relajador mantienen las condiciones de sus fuentes según `ATTRIBUTION.md`; es necesario revisarlas antes de uso comercial.
- No se documentan sesgos, tasas de alucinación ni cobertura lingüística; el modelo no es lingüístico y su evaluación debe centrarse en validez cristalina y simetría.
- No se proporcionan métricas de calidad de generación en la información disponible; cualquier uso en producción requiere validación propia con relajación y cálculo de estabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stases/orbitol
- Artículo: https://arxiv.org/abs/2610.30086
- Código (MIT): https://github.com/stases/orbitol
- Instrucciones de reproducción: `docs/reproduce.md` en el repositorio de código
