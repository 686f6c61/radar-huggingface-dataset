# thienluuaz/btcrecover-multigpu-seed-scanner

## Resumen

El artefacto publicado bajo el identificador `thienluuaz/btcrecover-multigpu-seed-scanner` no es un modelo de lenguaje ni un modelo de IA en el sentido habitual del término. Se trata de un binario ejecutable para Windows x64 (`btcrecover-multigpu-seed-scanner-v1.2.0-win64.exe`, empaquetado en un ZIP de 8,9 MB) que la model card describe como una herramienta de recuperación de carteras de criptomonedas: parseo de keystores LevelDB, validación de mnemónicos BIP39, derivación de direcciones BIP44/BIP84 y comprobación de saldos en EVM, Solana y Bitcoin.

La publicación no incluye pesos, arquitectura, tokenizador ni ningún artefacto propio de un modelo entrenado. Los tags de Hugging Face (`windows`, `windows-11`, `x64`, `portable`) y la licencia MIT declarada corresponden a la distribución de un ejecutable, no a un modelo. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

Desde la perspectiva de evaluación de modelos, este artefacto queda fuera de alcance: no hay parámetros, contexto, cuantizaciones ni benchmarks que analizar. Además, el patrón de distribución (ZIP alojado en un repositorio de GitHub de terceros, contraseña fija para extraer el archivo, instrucciones para ejecutar como administrador y para añadir exclusiones en Windows Defender) es característico de campañas de distribución de software no verificado, no de un proyecto de IA open source. Se recomienda no ejecutar el binario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; aplicable a la interfaz del ejecutable, no a un modelo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.exe` dentro de un `.zip`) |

## Arquitectura y entrenamiento

No aplica. El artefacto no contiene un modelo entrenado, ni datos de entrenamiento, ni proceso de ajuste (RLHF, DPO u otros). La model card describe módulos funcionales de una aplicación de escritorio: un parser de LevelDB para keystores de extensiones de navegador, un validador BIP39 local para mnemónicos de 12, 18 y 24 palabras, un derivador de direcciones multi-cadena (BIP44/BIP84 sobre EVM, Solana y BTC), un solucionador de mnemónicos parciales, un exportador de saldos y un auditor de tokens ERC20/SPL.

Las cifras que aparecen en la model card (consistencia del 99,7 %, 98,6 %, 98,1 %; sondeo a 473 Hz; 8 hilos de trabajo) no vienen acompañadas de metodología, conjuntos de validación ni reproducibilidad, por lo que no son verificables. El binario se distribuye con una contraseña de extracción fija (`2026`) y con instrucciones explícitas para ejecutarlo como administrador y para excluirlo de las comprobaciones de Windows Defender y SmartScreen, lo que impide cualquier auditoría del contenido antes de su ejecución.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de los modelos de IA.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- Las capacidades que declara la model card son las de una utilidad de escritorio para manipulación de carteras cripto (parseo de keystores, validación BIP39, derivación de direcciones, comprobación de saldos).
- La lista de idiomas de los metadatos corresponde, en su caso, a la interfaz de la aplicación, no a competencia multilingüe de un modelo.

## Casos de uso

No se identifican casos de uso legítimos para un blog de evaluación de modelos de IA. El artefacto no es desplegable como modelo y su función declarada (recuperación de mnemónicos y claves de carteras de criptomonedas) tiene implicaciones de seguridad y legalidad que desaconsejan cualquier recomendación de uso. A modo de advertencia, los escenarios en los que se enmarcaría son:

- Recuperación de carteras propias: el caso legítimo teórico sería recuperar el acceso a una wallet propia con un mnemónico dañado; existen herramientas auditables y de código abierto para ello, y esta distribución no lo es.
- Ejecución de binarios de procedencia no verificada: el patrón (ZIP con contraseña, repositorio de GitHub ajeno al autor declarado, instrucciones para desactivar Defender) es incompatible con cualquier política de despliegue en producción.
- Uso en entornos corporativos: queda descartado por ausencia de trazabilidad, firma de código y análisis de malware.
- Integración en pipelines: no aplica; no hay API, SDK ni formato de modelo.
- Evaluación comparativa de modelos: no aplica; no hay pesos ni benchmarks.
- Investigación sobre modelos open source: no aporta nada al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras de la model card (99,7 %, 98,6 %, 98,1 % de "consistencia", 473 Hz de sondeo) carecen de definición métrica y de metodología, por lo que no se recogen como resultados.

## Requisitos de hardware

- VRAM: no aplica; no es un modelo y no requiere GPU para inferencia.
- GPU recomendadas: no aplica. El nombre del artefacto sugiere uso de múltiples GPU, pero no se documenta ningún requisito ni backend de cómputo verificable.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama y TGI no son relevantes). El artefacto se distribuye como `.exe` para Windows 10/11 x64.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo. Como referencia de herramientas legítimas y auditables en el mismo dominio funcional (recuperación de carteras), cabría citar utilidades de código abierto ampliamente revisadas, pero ninguna de ellas es un modelo de IA y no se dispone aquí de datos comparativos verificados.

| Criterio | Este artefacto | Modelo de IA típico |
|---|---|---|
| Pesos publicados | No | Sí (safetensors, GGUF) |
| Arquitectura documentada | No | Sí |
| Benchmarks reproducibles | No | Habitualmente sí |
| Distribución | `.exe` en ZIP con contraseña | Repositorio de pesos |
| Auditabilidad | Nula antes de ejecución | Alta |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, compararse ni desplegarse como tal.
- Riesgo de seguridad alto: binario sin firma, distribuido fuera de Hugging Face (GitHub de terceros), con contraseña fija de extracción e instrucciones para ejecutarlo como administrador y excluirlo de Windows Defender y SmartScreen.
- El dominio funcional declarado (recuperación de mnemónicos y claves de carteras) es sensible: su uso sobre carteras de terceros es ilegal en la mayoría de jurisdicciones.
- Licencia MIT declarada en metadatos, sin texto de licencia verificable en el repositorio; irrelevante dada la naturaleza del artefacto.
- Cero descargas y cero likes: sin señal de validación por parte de la comunidad.
- Fechas de creación y actualización (noviembre de 2026) y métricas de la model card (509K descargas) inconsistentes con los metadatos del repositorio.
- No debe ejecutarse en ningún entorno, ni de desarrollo ni de producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/thienluuaz/btcrecover-multigpu-seed-scanner
- Repositorio de GitHub referenciado en la model card: https://github.com/GuqaveVe86/btcrecover-multigpu-seed-scanner
- No se han encontrado papers, blogs, demos ni documentación técnica adicional en la información proporcionada.
